"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const check_1 = require("express-validator/check");
const passport_1 = __importDefault(require("passport"));
const ApiError = __importStar(require("../errors"));
const UserModel = __importStar(require("../models/User"));
// TODO
exports.ApiKeyStrategy = 0;
// TODO
exports.userExists = (req, res, next) => {
    return res.json(ApiError);
};
/**
 * API Endpoint `/auth/login` - Allows users to login to their accounts
 *
 * @param req Express request
 * @param res Express response
 * @param next Express next
 */
exports.login = (req, res, next) => {
    if (req.user) {
        return res.status(403).json({
            success: false,
            message: 'User is already logged in'
        });
    }
    passport_1.default.authenticate('local', (err, user, info) => {
        // Shouldn't fail as we just created the user this is referencing
        let userResult = UserModel.User.findOne({ email: req.body.email });
        if (!user) {
            return userResult.then((doc) => {
                attemptedLogin(doc, req, res, false);
                res.status(401).json(ApiError.json(ApiError.ErrorType.LoginFailed));
            });
        }
        req.login(user, (err) => {
            if (err) {
                return next(err);
            }
            // Store session information in mongodb in order to be able to invalidate sessions           
            userResult.then((doc) => {
                if (doc) {
                    attemptedLogin(doc, req, res, true);
                    successfulLogin(doc, req, res);
                }
            }).catch(console.log);
            res.status(200).json({
                'success': true,
                'message': 'Login Successful'
            });
        });
    })(req, res, next);
};
/**
 * API Endpoint `/auth/logout` - Allows users to destroy their session and logout
 *
 * @param req Express request
 * @param res Express response
 * @param next Express next
 */
exports.logout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            return next(err);
        }
        res.json({
            'success': true,
            'message': 'Logged out'
        });
    });
};
/**
 * API Endpoint `/auth/register` - Allows new users to create an account
 *
 * @param req Express request
 * @param res Express response
 * @param next Express next
 */
exports.register = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const errors = check_1.validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: errors.array(),
        });
    }
    const newUser = new UserModel.User({
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    });
    let userQuery = UserModel.User.findOne({ username: req.body.username }).then((doc) => {
        if (doc) {
            return res.status(400).json(ApiError.json(ApiError.ErrorType.UserExists));
        }
    }).catch(console.log);
    let emailQuery = UserModel.User.findOne({ email: req.body.email }).then((doc) => {
        if (doc) {
            return res.status(400).json(ApiError.json(ApiError.ErrorType.UserExists));
        }
    }).catch(console.log);
    let queryResults = yield Promise.all([userQuery, emailQuery]);
    for (let existsResult of queryResults) {
        if (existsResult) {
            return existsResult;
        }
    }
    newUser.save().then((doc) => {
        req.login(doc, (err) => {
            if (err) {
                return next(err);
            }
            successfulLogin(doc, req, res);
        });
        res.json({
            success: true,
            message: 'User has been successfully registered'
        });
    }).catch((err) => {
        res.json({
            success: false,
            message: `User failed to be created. Reason: ${err}`
        });
    });
});
/**
 * Utility function that logs attempted logins
 *
 * @param document: `UserModel.UserModel` - User query mongoose document
 * @param req Express request
 * @param res Express response
 * @param success Whether the login was successful or not
 */
const attemptedLogin = (document, req, res, success) => {
    if (!document) {
        throw new Error(`Document is null`);
    }
    if (success) {
        document.lastLogin = new Date();
    }
    document.loginAttempts = document.loginAttempts.concat([{
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip,
            dateAttempted: new Date(),
            successful: success,
        }]);
    document.save().catch(console.log);
};
/**
 * Utility function that logs successful logins
 *
 * @param document: `UserModel.UserModel` - User query mongoose document
 * @param req Express request
 * @param res Express response
 */
const successfulLogin = (document, req, res) => {
    // This should never happen, and if it does... 😬
    if (!document) {
        throw new Error('Document not found even though user exists');
    }
    document.currentSessions = document.currentSessions.concat([{
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip,
            dateAttempted: new Date(),
            sessionKey: `sess:${req.sessionID}`
        }]);
    document.save();
};
