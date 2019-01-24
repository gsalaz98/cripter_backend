"use strict";
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
            'success': true,
            'message': doc.toObject().currentSessions
        });
    }).catch(console.log);
};
/**
 * API Endpoint `/auth/sessions/delete/:sessionId` Allows users to delete a currently active session.
 * We will not let the user delete their own session; They can log out instead
 *
 * @param req Express request
 * @param res Express response
 * @param next Express next
 */
exports.deleteSession = (req, res, next) => {
    if (!req.user) {
        return res.status(403).json(ApiError.json(ApiError.ErrorType.AuthenticationRequired));
    }
    UserModel.User.findById(req.user).then((doc) => {
        for (let session of doc.currentSessions) {
            if (req.params.sessionId == session._id) {
                console.log("Found");
                // Remove the session from mongodb, then from redis
                // This is actually fast because the session value is cached
                // in MongoDB and deletes are O(1) according to the official redis docs
                let sessionKey = session.sessionKey;
                const removeSession = session.remove();
                const removeRedisSession = new Promise((resolve, reject) => {
                    RedisConfig.redisClient.del(sessionKey, resolve);
                }).catch(next);
                const removeStatus = Promise.all([removeSession, removeRedisSession]);
                removeStatus.then((result) => {
                    res.json({
                        success: true,
                        message: 'Deleted user session'
                    });
                }).catch(err => {
                    console.log(err);
                    res.json({
                        success: false,
                        message: 'Failed to delete user session'
                    });
                });
                break;
            }
        }
    }).catch(next);
};
