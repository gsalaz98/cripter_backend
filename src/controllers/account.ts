import { validationResult } from 'express-validator/check';
import mongoose from 'mongoose';
import passport from 'passport';

import * as ApiError from '../errors';
import { Request, Response } from 'express';
import { Strategy } from 'passport-local';
import * as UserModel from '../models/User';

// TODO
export const ApiKeyStrategy = 0;

// TODO
export const userExists = (req: Request, res: Response, next: Function) => {
    return res.json(ApiError);
}

/**
 * API Endpoint `/auth/login` - Allows users to login to their accounts
 * 
 * @param req Express request
 * @param res Express response
 * @param next Express next
 */
export const login = (req: Request, res: Response, next: Function) => {
    if (req.user) {
        return res.status(403).json({
            success: false,
            message: 'User is already logged in'
        });
    }
    passport.authenticate('local', (err, user, info) => {
        // Shouldn't fail as we just created the user this is referencing
        let userResult = UserModel.User.findOne({ email: req.body.email });

        if (!user) {
            return userResult.then((doc) => {
                attemptedLogin(doc, req, res, false);
                res.status(401).json(ApiError.json(ApiError.ErrorType.LoginFailed));
            })
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
export const logout = (req: Request, res: Response, next: Function) => {
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
export const register = async (req: Request, res: Response, next: Function) => {
    const errors = validationResult(req);

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
    
    let userQuery = UserModel.User.findOne({ username: req.body.username }).then((doc: mongoose.Document) => {
        if (doc) {
            return res.status(400).json(ApiError.json(ApiError.ErrorType.UserExists));
        }
    }).catch(console.log);

    let emailQuery = UserModel.User.findOne({ email: req.body.email }).then((doc: mongoose.Document) => {
        if (doc) {
            return res.status(400).json(ApiError.json(ApiError.ErrorType.UserExists));
        }
    }).catch(console.log);

    let queryResults = await Promise.all([userQuery, emailQuery]);

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
        })
        res.json({
            success: true,
            message: 'User has been successfully registered'
        });
    }).catch((err) => {
        res.json({
            success: false,
            message: `User failed to be created. Reason: ${err}`
        });
    })
}

/**
 * Utility function that logs attempted logins 
 * 
 * @param document: `UserModel.UserModel` - User query mongoose document
 * @param req Express request
 * @param res Express response
 * @param success Whether the login was successful or not
 */
const attemptedLogin = (document: UserModel.UserModel, req: Request, res: Response, success: boolean) => {
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
const successfulLogin = (document: UserModel.UserModel, req: Request, res: Response) => {
    // This should never happen, and if it does... 😬
    if (!document) {
        throw new Error('Document not found even though user exists');
    }

    document.currentSessions = document.currentSessions.concat([{
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        dateAttempted: new Date(),
        sessionKey: `sess:${req.sessionID}`
    } as UserModel.CurrentSessionModel]);

    document.save();
};
