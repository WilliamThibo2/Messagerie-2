const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function (passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'https://messagerie2-1.onrender.com/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            console.log("Google profile:", profile);
            let user = await User.findOne({ googleId: profile.id });

            if (!user) {
                user = await User.create({
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    username: profile.displayName
                });
                console.log("User created:", user);
            }
            return done(null, user);
        } catch (error) {
            console.error("Error during authentication:", error);
            return done(error, null);
        }
    }));

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            console.log("Deserialized user:", user);
            done(null, user);
        } catch (error) {
            console.error("Error deserializing user:", error);
            done(error, null);
        }
    });
};
