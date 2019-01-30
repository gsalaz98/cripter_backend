import { Request, Response } from 'express';
import * as ApiError from '../errors';
import * as UserModel from '../models/User';
/**
 * API Endpoint `/subscriptions/current` - Gets current subscriptions to the given data sources
 * @param req Express request
 * @param res Express response
 * @param next Express next
 * 
 * TODO: Integrate subscription description, title, etc.
 */
export const getSubscriptions = (req: Request, res: Response, next: any) => {
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