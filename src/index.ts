import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import session from 'express-session';
import { check } from 'express-validator/check';
import helmet from 'helmet';
import mongoose from 'mongoose';
import passport from 'passport';
import redis from 'redis';
import redisStore from 'connect-redis'

import { config } from './config/config';
import * as PassportConfig from './config/passport';
import * as RedisConfig from './config/redis';
import * as ApiErrors from './errors';
import * as AccountController from './controllers/account';
import * as SessionsController from './controllers/sessions';
import * as UserModel from './models/User';

let RedisStore = redisStore(session);

// Replace the deprecated mongoose promise with the es2015 version
mongoose.Promise = Promise;
mongoose.connect(config.db_connection);

// Setup passport strategies
passport.use(PassportConfig.LocalStrategy);

export const app = express();

app.use(helmet());
app.use(compression());
app.use(session({
    store: new RedisStore({ client: RedisConfig.redisClient }),
    name: 'user_session',
    secret: process.env.SESSION_SECRET || 'c308101f5823f2d4d02e10dd789005312906f451a1789c705e797751458397f0ef5e9e791bdca4624205970f189c1a86',
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('static'));

/*-*-*-*-*-
 * Routes *
 *-*-*-*-*/

// User login/logout
app.get('/auth/exists/', AccountController.userExists);
app.post('/auth/login', AccountController.login);
app.get('/auth/logout', AccountController.logout);
app.post('/auth/register', [
   check('email').isEmail(),
   check('username').isAlphanumeric('en-US'),
   check('password').isLength({ min: 6 })], AccountController.register);

// Sessions
app.get('/auth/sessions', SessionsController.getSessions);
app.get('/auth/sessions/delete/:sessionId', SessionsController.deleteSession);

// 404 route
app.use((req, res, next) => {
    res.json(ApiErrors.json(ApiErrors.ErrorType.MethodDoesNotExist));
});

// 500 Internal server error
app.use((err: any, req: any, res: any, next: any) => {
    if (err instanceof SyntaxError) {
        return res.status(400).json({
            success: false,
            message: 'Received malformed JSON'
        });
    }
    if (err instanceof Error) {
        console.log(err);
        return res.status(500).json({
            success: false,
            reason: 'Internal Server Error'
        });
    }
});

/*-*-*-*-*-*-*- 
 * End routes *
 *-*-*-*-*-*-*/

app.listen(config['port']);
console.log(`Listening on port ${config['port']}`);
