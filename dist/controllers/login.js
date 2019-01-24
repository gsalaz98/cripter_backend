"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const passport_local_1 = require("passport-local");
const User_1 = require("../models/User");
exports.LocalStrategy = new passport_local_1.Strategy({ session: true }, (username, password, done) => {
    User_1.User.findOne({ username: username }, (err, user) => {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, { message: 'Username does not exist' });
        }
        if (!this.passwordMatches(password, user.password)) {
            return done(null, false, { message: 'Password is incorrect' });
        }
        return done(null, user);
    });
});
exports.attemptedLogin = (req, res, success) => {
    const user = User_1.User.findOne({ email: req.body.email }).then((doc) => {
        if (!doc) {
            throw new Error(`Document is null`);
        }
        if (success) {
            doc.lastLogin = new Date();
        }
        doc.update({ user: req.body.email }, { $push: {
                loginAttempts: {
                    userAgent: req.headers.user_agent,
                    ipAddress: req.ip,
                    dateAttempted: new Date(),
                    successful: success,
                }
            } });
    }).catch((reason) => {
        console.log(reason);
    });
};
