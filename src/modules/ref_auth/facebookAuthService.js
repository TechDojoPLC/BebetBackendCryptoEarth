const passport = require("passport");
const strategy = require("passport-facebook");
const FacebookStrategy = strategy.Strategy;

const { facebookCredentials } = require("../../config");

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(
  new FacebookStrategy(
    {
      clientID: facebookCredentials.clientID,
      clientSecret: facebookCredentials.clientSecret,
      callbackURL: facebookCredentials.callbackURL,
      profileFields: ["id", "name"],
    },
    function (token, refreshToken, profile, done) {
      done(null, profile);
    }
  )
);

module.exports = {
  passport,
  successURL: facebookCredentials.successURL,
  failureURL: facebookCredentials.failureURL,
};
