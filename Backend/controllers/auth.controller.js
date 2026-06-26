import passport from 'passport';
import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';
export const googleLogin = passport.authenticate('google', {
  scope: ['profile', 'email'],
  hd: 'mnit.ac.in', 
  prompt: 'select_account',
});
export const googleCallback = (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
    if (err) {
      console.error(err);
      return res.redirect('http://localhost:5173/?error=InternalServerError');
    }
    if (!user) {
      // info.message contains the string from our done(null, false, { message: '...' })
      const errorMsg = info?.message || 'Authentication failed';
      return res.redirect(`http://localhost:5173/?error=${encodeURIComponent(errorMsg)}`);
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error(loginErr);
        return res.redirect('http://localhost:5173/?error=LoginFailed');
      }
      if (user.roles.includes('instructor')) {
        return res.redirect('http://localhost:5173/dashboard');
      } else {
        return res.redirect('http://localhost:5173/student/dashboard');
      }
    });
  })(req, res, next);
};

export const getCurrentUser = (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not logged in' });
  }
  res.json(req.user); 
};
export const logout = (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.session.destroy(err => {
      if (err) return next(err);
      res.clearCookie('connect.sid');
      return res.json({ message: 'Logged out successfully' });
    });
  });
};

export const manualSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const domain = email.split('@')[1];
    if (domain !== 'mnit.ac.in') {
      return res.status(400).json({ message: 'Use your MNIT email address' });
    }

    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      AvatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      roles: ['student']
    });

    req.login(user, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Login after signup failed' });
      }
      return res.status(201).json({
        message: 'Signup successful',
        user: { id: user._id, name: user.name, email: user.email, roles: user.roles }
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const manualLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.password && user.googleId) {
      return res.status(400).json({ message: 'This email is registered with Google. Please use Google Login.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    req.login(user, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Login failed' });
      }
      return res.json({
        message: 'Login successful',
        user: { id: user._id, name: user.name, email: user.email, roles: user.roles }
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const becomeInstructor = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not logged in' });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.roles.includes('instructor')) {
      user.roles.push('instructor');
      await user.save();
    }
    return res.json({ message: 'Successfully became an instructor', user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};