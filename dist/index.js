"use strict";
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
const body_parser_1 = __importDefault(require("body-parser"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const check_1 = require("express-validator/check");
const helmet_1 = __importDefault(require("helmet"));
const mongoose_1 = __importDefault(require("mongoose"));
const passport_1 = __importDefault(require("passport"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const config_1 = require("./config/config");
const PassportConfig = __importStar(require("./config/passport"));
const RedisConfig = __importStar(require("./config/redis"));
const ApiErrors = __importStar(require("./errors"));
const AccountController = __importStar(require("./controllers/account"));
const SessionsController = __importStar(require("./controllers/sessions"));
const SubscriptionsController = __importStar(require("./controllers/subscriptions"));
exports.RedisStore = connect_redis_1.default(express_session_1.default);
// Replace the deprecated mongoose promise with the es2015 version
mongoose_1.default.Promise = Promise;
mongoose_1.default.connect(config_1.config.db_connection);
// Setup passport strategies
passport_1.default.use(PassportConfig.LocalStrategy);
exports.app = express_1.default();
exports.app.use(helmet_1.default());
exports.app.use(compression_1.default());
exports.app.use(express_session_1.default({
    store: new exports.RedisStore({ client: RedisConfig.redisClient }),
    name: 'user_session',
    secret: process.env.SESSION_SECRET || 'c308101f5823f2d4d02e10dd789005312906f451a1789c705e797751458397f0ef5e9e791bdca4624205970f189c1a86',
}));
exports.app.use(body_parser_1.default.json());
exports.app.use(cookie_parser_1.default());
exports.app.use(passport_1.default.initialize());
exports.app.use(passport_1.default.session());
exports.app.use(express_1.default.static('static'));
/*-*-*-*-*-
 * Routes *
 *-*-*-*-*/
// User login/logout
exports.app.get('/auth/exists/', AccountController.userExists);
exports.app.post('/auth/login', [
    check_1.check('email').isEmail(),
    check_1.check('password').isLength({ min: 6 })
], AccountController.login);
exports.app.get('/auth/logout', AccountController.logout);
exports.app.post('/auth/register', [
    check_1.check('email').isEmail(),
    check_1.check('username').isAlphanumeric('en-US'),
    check_1.check('password').isLength({ min: 6 })
], AccountController.register);
// Sessions
exports.app.get('/auth/sessions', SessionsController.getSessions);
exports.app.get('/auth/sessions/delete/:sessionId', SessionsController.deleteSession);
// Subscriptions
exports.app.get('/subscriptions/current', SubscriptionsController.getSubscriptions);
// 404 route
exports.app.use((req, res, next) => {
    res.json(ApiErrors.json(ApiErrors.ErrorType.MethodDoesNotExist));
});
// 500 Internal server error route
exports.app.use((err, req, res, next) => {
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
exports.app.listen(config_1.config['port']);
console.log(`Listening on port ${config_1.config['port']}`);
