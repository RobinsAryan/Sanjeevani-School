import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import user from '../../models/User.js';
import dotenv from 'dotenv';
dotenv.config({ path: ".env" });

export default function (passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GoogleclientId,
        clientSecret: process.env.GoogleclientSecret,
        callbackURL: process.env.callbackURL
    }, async (accessToken, refreshToken, profile, done) => {
        let data = await user.findOne({ email: profile.emails[0].value })
        if (data) {
            return done(null, data);
        }
        else {
            return done(null, false, { message: "No user with this Email" });
        }
    }
    ));


    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(async function (id, done) {
        let userData = await user.findById(id);
        let { _id, password, ...finalUser } = userData._doc;
        done(null, finalUser);
    });
}