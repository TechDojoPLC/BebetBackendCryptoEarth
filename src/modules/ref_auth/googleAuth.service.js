const passport = require("passport");
const strategy = require("passport-google-oauth20");
const GoogleStrategy = strategy.Strategy;

const { googleCredentials } = require("../../config");

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: googleCredentials.clientID,
      clientSecret: googleCredentials.clientSecret,
      callbackURL: googleCredentials.callbackURL,
      scope: ["profile"],
    },
    (token, refreshToken, profile, done) => {
      done(null, profile);
    }
  )
);

module.exports = {
  passport,
  successURL: googleCredentials.successURL,
  failureURL: googleCredentials.failureURL,
};
