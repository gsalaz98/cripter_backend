import mongoose from 'mongoose';
import passport from 'passport';
import { Strategy } from 'passport-local';
import * as UserModel from '../models/User';

export const LocalStrategy = new Strategy({ session: true, usernameField: 'email'}, (email, password, done) => {
    UserModel.User.findOne({ email: email }).then((doc: mongoose.Document) => {
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

passport.serializeUser<mongoose.Document, any>((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    UserModel.User.findById(id, (err, user) => {
        if (!user) {
            return done(err, null);
        }
        done(err, user._id);
    });
});