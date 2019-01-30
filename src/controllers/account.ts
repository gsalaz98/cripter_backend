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
        return res.status(403).json(ApiError.json(ApiError.ErrorType.UserLoggedIn));
    }

    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }

        let userResult = UserModel.User.findOne({ email: req.body.email });

        if (!user) {
            attemptedLogin(userResult, req, res, false);
            return res.status(401).json(ApiError.json(ApiError.ErrorType.LoginFailed));
        }

        req.login(user, err => {
            if (err) {
                return next(err);
            }
            // Store session information in MongoDB in order to be able to invalidate sessions
            // and present session information to the user
            attemptedLogin(userResult, req, res, true);

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
export const logout = (req: Request, res: Response, next: any) => {
    req.session.destroy((err) => {
        if (err) {
            return next(err);
        }
        UserModel.User.findByIdAndUpdate(req.user, { $pull: { currentSessions: { sessionKey: `sess:${req.sessionID}` }}}).then(doc => {
            res.json({
                'success': true,
                'message': 'Logged out'
            });
        }).catch(next);
    });
};

/**
 * API Endpoint `/auth/register` - Allows new users to create an account
 * 
 * @param req Express request
 * @param res Express response
 * @param next Express next
 */
export const register = async (req: Request, res: Response, next: any) => {
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
    
    let userQuery = UserModel.User.findOne({ $or: [
        { username: req.body.username }, 
        { email: req.body.email }
    ]});
    
    userQuery.then((doc: mongoose.Document) => {
        if (doc) {
            return res.status(400).json(ApiError.json(ApiError.ErrorType.UserExists));
        }
        newUser.save().then(userDoc => {
            req.login(userDoc, (err) => {
                if (err) {
                    return next(err);
                }

                attemptedLogin(userQuery, req, res, true);

                res.json({
                    success: true,
                    message: 'User has been successfully registered'
                });
            });
        }).catch(err => {
            res.json({
                success: false,
                message: `User failed to be created. Please try again later`
            });

            console.log(err);
        })
    }).catch(next);
}

/**
 * Utility function that logs attempted and successful login attempts
 * 
 * @param document: `UserModel.UserModel` - User query mongoose document
 * @param req Express request
 * @param res Express response
 * @param success Whether the login was successful or not. Will write to `currentSessions` if login is successful
 */
const attemptedLogin = (document: mongoose.DocumentQuery<UserModel.UserModel, UserModel.UserModel>, req: Request, res: Response, success: boolean) => {
    document.then(doc => {
        if (!doc) {
            return;
        }
        if (success) {
            // Add to current sessions if we have a successful login
            doc.lastLogin = new Date();
            doc.currentSessions = doc.currentSessions.concat([{
                userAgent: req.headers['user-agent'],
                ipAddress: req.ip,
                dateAttempted: new Date(),
                sessionKey: `sess:${req.sessionID}`
            } as UserModel.CurrentSessionModel]);
        }

        doc.loginAttempts = doc.loginAttempts.concat([{
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip,
            dateAttempted: new Date(),  
            successful: success,
        }]);

        doc.save().catch(console.log);
    }).catch(console.log);
};