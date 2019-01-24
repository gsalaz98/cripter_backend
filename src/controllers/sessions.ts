import { Request, Response } from 'express';
import * as RedisConfig from '../config/redis';
import * as ApiError from '../errors';
import * as UserModel from '../models/User';

/**
 * API Endpoint `/auth/sessions/` - Allows users to get their currently active sessions
 * 
 * @param req Express request
 * @param res Express response
 * @param next Express next
 */
export const getSessions = (req: Request, res: Response, next: Function) => {
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
 * TODO: Finish up this function
 * 
 * @param req Express request
 * @param res Express response
 * @param next Express next
 */
export const deleteSession = (req: Request, res: Response, next: any) => {
    if (!req.user) {
        return res.status(403).json(ApiError.json(ApiError.ErrorType.AuthenticationRequired));
    }

    UserModel.User.findByIdAndUpdate(req.user, { $pull: { currentSessions: { _id: req.params.sessionId }}}).then((doc: UserModel.UserModel) => {
        console.log("Deleted")
    }).catch(err => {
        res.json()
    });
};