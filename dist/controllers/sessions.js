"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const RedisConfig = __importStar(require("../config/redis"));
const ApiError = __importStar(require("../errors"));
const UserModel = __importStar(require("../models/User"));
/**
 * API Endpoint `/auth/sessions/` - Allows users to get their currently active sessions
 *
 * @param req Express request
 * @param res Express response
 * @param next Express next
 */
exports.getSessions = (req, res, next) => {
    if (!req.user) {
        return res.status(403).json(ApiError.json(ApiError.ErrorType.AuthenticationRequired));
    }
    UserModel.User.findById(req.user).then((doc) => {
        res.json({
            success: true,
            message: doc.toObject().currentSessions.map((item) => {
                item.currentSession = item.sessionKey === `sess:${req.sessionID}`;
                delete item.sessionKey;
                return item;
            })
        });
    }).catch(next);
};
/**
 * API Endpoint `/auth/sessions/delete/:sessionId` Allows users to delete a currently active session.
 * We will not let the user delete their own session; They can log out instead
 *
 * @param req Express request
 * @param res Express response
 * @param next Express next
 */
exports.deleteSession = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(403).json(ApiError.json(ApiError.ErrorType.AuthenticationRequired));
    }
    UserModel.User.findOne({ _id: req.user }).then(userDoc => {
        for (let session of userDoc.currentSessions) {
            if (session._id == req.params.sessionId) {
                if (session.sessionKey == `sess:${req.sessionID}`) {
                    return res.status(401).json(ApiError.json(ApiError.ErrorType.CannotDeleteOwnSession));
                }
                UserModel.User.update({ _id: req.user }, { $pull: { currentSessions: { _id: req.params.sessionId } } }).then(delDoc => {
                    if (!delDoc.nModified) {
                        return res.status(401).json(ApiError.json(ApiError.ErrorType.SessionNotFound));
                    }
                    RedisConfig.redisClient.del(session.sessionKey, (err, response) => {
                        res.json({
                            success: true,
                            message: 'Session has been deleted'
                        });
                    });
                }).catch(next);
                break;
            }
        }
    }).catch(next);
});
