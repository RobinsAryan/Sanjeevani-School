import user from '../../models/User.js';
import { Strategy as localStrategy } from 'passport-local';
import { createLog } from '../logs/logs.js';

export default function (passport) {
    passport.use(new localStrategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
            if (email.length == 4) {
                let data = await user.findOne({ rid: email });
                if (!data) {
                    return done(null, false, { message: "User Not Exits" });
                }
                if (password !== data.password) {
                    return done(null, false, { message: "Password Not Match" });
                }
                else {
                    return done(null, data);
                }
            }
            else {
                email = parseInt((email).split('-').pop());
                let data = await user.findOne({ phone: email, role: "Teacher" });
                if (!data) {
                    return done(null, false, { message: "User Not Exits" });
                }
                if (password !== data.password) {
                    return done(null, false, { message: "Password Not Match" });
                }
                else {
                    return done(null, data);
                }
            }
        }
        catch (err) {
            createLog(null, `Local Authentication Fail reason:${err}`, 'error');
            return done(null, false, { message: "Server Error" });
        }
    }));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(async function (id, done) {
        let userData = await user.findById(id);
        let { password, ...finalUser } = userData._doc;
        done(null, finalUser);
    });

}