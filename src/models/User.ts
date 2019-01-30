import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import passport from 'passport';
import { Strategy } from 'passport-local';
import { config } from '../config/config'
import * as SubscriptionModels from './Subscription';

export interface AttemptedLoginModel {
    userAgent: string,
    ipAddress: string,
    dateAttempted: Date,
    successful: boolean,
}

export interface CurrentSessionModel extends mongoose.Document {
    userAgent: string,
    ipAddress: string,
    dateAttempted: Date,
    sessionKey: string,
}

export interface ApiKeysModel {
    key: string, 
    createdOn: Date, 
    expires: boolean, 
    expiryDate: Date, 
    ipWhiteList: string[]
}

export interface StripeModel {
    stripeApiKey: string,
    hook: string,
    firstName: string,
    lastName: string,
    email: string,
}

/**
 * Extend mongoose.Document in order to have access
 * to the following members from `UserSchema`
 */
export interface UserModel extends mongoose.Document {
    userId: number,
    userPermissions: Number[],
    email: string,
    username: string,
    password: string,
    createdOn: Date,
    lastModified: Date,
    lastLogin: Date,
    loginAttempts: AttemptedLoginModel[],
    currentSessions: CurrentSessionModel[],
    apiKeys: ApiKeysModel[],
    subscriptions: SubscriptionModels.SubscriptionModel[],
    customerType: number,
    stripe: StripeModel
}

export const UserSchema = new mongoose.Schema<UserModel>({
    userId: Number,
    userPermissions: [Number],
    email: {
        type: String,
        required: true,
        index: {
            unique: true,
        }
    },
    username: {
        type: String,
        required: true,
        index: {
            unique: true,
        }
    },
    password: {
        type: String,
        required: true,
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    lastModified: {
        type: Date,
        default: Date.now,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
    loginAttempts: [{
        userAgent: String,
        ipAddress: String,
        dateAttempted: Date,  
        successful: Boolean,
    }],
    currentSessions: [{
        userAgent: String,
        ipAddress: String,
        dateAttempted: Date,
        sessionKey: String
    }],
    apiKeys: [{
        key: String, 
        createdOn: Date, 
        expires: Boolean, 
        expiryDate: Date, 
        ipWhiteList: [String] 
    }],
    subscriptions: [{
        subscriptionId: Number,
        createdOn: Date,
        subscriptionExpires: Boolean, 
        expiryDate: Date
    }],
    customerType: Number,
    stripe: {
        stripeApiKey: String,
        hook: String,
        firstName: String,
        lastName: String,
        email: String,
    }
});

/**
 * Middleware can accomplish multiple tasks:
 * 1. Updates the 'lastModified' field
 * 2. Can hash the password using bcrypt if the field has been modified
 */
UserSchema.pre('save', function(next, res) {
    const user = this;

    if (user.isModified('password')) { 
        bcrypt.genSalt(config.salt_rounds).then((salt) => {
            bcrypt.hash(user.get('password'), salt).then((hashed) => {
                user.set('password', hashed);
                user.set('lastModified', new Date());
                next();
            }).catch(next);
        }).catch(next);
    } 
    else {
        next();
    }
});

/**
 * Determines whether the plaintext password matches the hashed password in the document
 * @param password unhashed password
 * @param hashedPassword hashed password
 */
export const passwordMatches = async (password: string, hashedPassword: string) => {
    return await bcrypt.compare(password, hashedPassword).then((same: boolean) => {
        return same;
    }).catch(console.log);
};

// Create the User model for creating queries
export const User = mongoose.model<UserModel>('User', UserSchema);