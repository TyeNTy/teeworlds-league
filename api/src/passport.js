const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const { SECRET } = require("./config");
const enumUserRole = require("./enums/enumUserRole");
const CustomStrategy = require("passport-custom").Strategy;

// load up the user model
const User = require("./models/user");

function getToken(req) {
  let token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  if (!token) token = req.cookies.jwt;
  return token;
}

module.exports = function (app) {
  const opts = {};
  opts.jwtFromRequest = getToken;
  opts.secretOrKey = SECRET;

  passport.use(
    enumUserRole.GUEST,
    new CustomStrategy(async function (req, done) {
      req.user = { role: enumUserRole.GUEST };
      done(null, req.user);
    }),
  );

  passport.use(
    enumUserRole.USER,
    new JwtStrategy(opts, async function (jwtPayload, done) {
      try {
        const user = await User.findOne({ _id: jwtPayload._id });
        if (user) return done(null, user);
        else return done(null, false);
      } catch (error) {
        console.log(error);
      }
      return done(null, false);
    }),
  );

  passport.use(
    enumUserRole.ADMIN,
    new JwtStrategy(opts, async function (jwtPayload, done) {
      try {
        const user = await User.findOne({ _id: jwtPayload._id });
        if (user && user.role === enumUserRole.ADMIN) return done(null, user);
        else return done(null, false);
      } catch (error) {
        console.log(error);
      }
      return done(null, false);
    }),
  );

  app.use(passport.initialize());
};
