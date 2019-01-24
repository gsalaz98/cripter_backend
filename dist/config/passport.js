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
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const UserModel = __importStar(require("../models/User"));
exports.LocalStrategy = new passport_local_1.Strategy({ session: true, usernameField: 'email' }, (email, password, done) => {
    UserModel.User.findOne({ email: email }).then((doc) => {
        if (!doc) {
            // Hash the password again so that malicious actors are unable
            // to enumerate emails by doing the following:
            // 1. Submit a valid email
            // 2. If the site hangs, then we have a valid email
            // 
            // This is mitigated by simply running the password matching function
            // in order to get accurate timing instead of using some random number + sleep.
            // This also has the benefit of rate limiting brute force attacks
            // HACK: Put the value 'a' as the bcrypt comparision string. This will prevent it from returning quickly.
            UserModel.passwordMatches(password, '$2a$16$Kt4v8Iura.NxztTdY/jeuOJFaAp5gxPHupwODALDQw8.zglYTZ/WW').then((_) => {
                done(null, false);
            }).catch((_) => {
                done(null, false);
            });
            return;
        }
        UserModel.passwordMatches(password, doc.get('password', String)).then((isMatch) => {
            done(null, isMatch ? doc : false);
        });
    }).catch((err) => {
        return done(err);
    });
});
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser((id, done) => {
    UserModel.User.findById(id, (err, user) => {
        if (!user) {
            return done(err, null);
        }
        done(err, user._id);
    });
});
