import { Request, Response } from 'express';
import { UserPermissions } from '../config/permissions';
import * as ApiError from '../errors';
import * as SubscriptionModel from '../models/Subscription';
import * as UserModel from '../models/User';

export const createDataSource = (req: Request, res: Response, next: any) => {
    if (!req.user) {
        res.status(403).json(ApiError.json(ApiError.ErrorType.AuthenticationRequired));
    }

    UserModel.User.findById(req.user).then((doc) => {
        if (doc.userPermissions.indexOf(UserPermissions.Admin) != 0) {
            return res.status(403).json(ApiError.json(ApiError.ErrorType.ImproperPermissions));
        }
    });
};