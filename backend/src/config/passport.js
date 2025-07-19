const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const db = require('./database');

const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    const sql = 'SELECT id, email, username, fullName FROM users WHERE id = ?';
    db.get(sql, [jwt_payload.id], (err, user) => {
      if (err) {
        return done(err, false);
      }
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    });
  })
);

module.exports = passport; 