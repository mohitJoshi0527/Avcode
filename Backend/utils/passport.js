import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.model.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: 'https://avcode.onrender.com/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || '';
        const domain = email.split('@')[1];

        console.log("🎯 Logging in with:", email);

        if (domain !== 'mnit.ac.in') {
          return done(null, false, { message: 'Use your MNIT email address' });
        }

        // ✅ Check if user exists
        let user = await User.findOne({ email });

        // ✅ If not, create user
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email,
            AvatarUrl: profile.photos?.[0]?.value || '',
          });
        }

        return done(null, user);
      } catch (err) {
        console.error("❌ Error in Google Strategy", err);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id); // serialize user ID only
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user); // this is attached to req.user
  } catch (err) {
    done(err, null);
  }
});
export default passport; 