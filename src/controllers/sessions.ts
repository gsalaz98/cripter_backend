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
export const getSessions = (req: Request, res: Response, next: any) => {
    if (!req.user) {
        return res.status(403).json(ApiError.json(ApiError.ErrorType.AuthenticationRequired));
    }

    UserModel.User.findById(req.user).then((doc) => {
        res.json({
            success: true,
            message: doc.toObject().currentSessions.map((item: any) => {
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
export const deleteSession = (req: Request, res: Response, next: any) => {
    if (!req.user) {
        return res.status(403).json(ApiError.json(ApiError.ErrorType.AuthenticationRequired));
    }

    UserModel.User.findOne({ _id: req.user }).then(userDoc => {
        for (let session of userDoc.currentSessions) {
            if (session._id == req.params.sessionId) {
                if (session.sessionKey == `sess:${req.sessionID}`) {
                    return res.status(401).json(ApiError.json(ApiError.ErrorType.CannotDeleteOwnSession));
                }

                UserModel.User.update({ _id: req.user }, { $pull: { currentSessions: { _id: req.params.sessionId }}}).then(delDoc => {
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
}