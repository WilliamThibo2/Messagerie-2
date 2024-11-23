const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
require('dotenv').config();

module.exports = function (passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        passReqToCallback: true
    }, async (request, accessToken, refreshToken, profile, done) => {
        try {
            console.log("Google profile:", profile);
            
            let user = await User.findOne({ 
                $or: [
                    { googleId: profile.id },
                    { email: profile.emails[0].value }
                ]
            });

            if (!user) {
                user = new User({
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    username: profile.displayName || profile.emails[0].value.split('@')[0]
                });
                await user.save();
            } else {
                // Mettre à jour l'ID Google si nécessaire
                if (!user.googleId) {
                    user.googleId = profile.id;
                    await user.save();
                }
            }

            return done(null, user);
        } catch (error) {
            console.error("Erreur d'authentification Google:", error);
            return done(error, null);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};
