"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApiError = __importStar(require("../errors"));
const UserModel = __importStar(require("../models/User"));
/**
 * API Endpoint `/subscriptions/current` - Gets current subscriptions to the given data sources
 * @param req Express request
 * @param res Express response
 * @param next Express next
 */
exports.getSubscriptions = (req, res, next) => {
    if (!req.user) {
        return res.status(403).json(ApiError.json(ApiError.ErrorType.AuthenticationRequired));
    }
    UserModel.User.findById(req.user).then(doc => {
        return res.json({
            success: true,
            message: doc.toObject().subscriptions
        });
    });
};
