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
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config/config");
exports.UserSchema = new mongoose_1.default.Schema({
    userId: Number,
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
exports.UserSchema.pre('save', function (next, res) {
    const user = this;
    if (user.isModified('password')) {
        console.log("hashing");
        bcrypt_1.default.genSalt(config_1.config.salt_rounds).then((salt) => {
            bcrypt_1.default.hash(user.get('password'), salt).then((hashed) => {
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
exports.passwordMatches = (password, hashedPassword) => __awaiter(this, void 0, void 0, function* () {
    return yield bcrypt_1.default.compare(password, hashedPassword).then((same) => {
        return same;
    }).catch(console.log);
});
// Create the User model for creating queries
exports.User = mongoose_1.default.model('User', exports.UserSchema);
