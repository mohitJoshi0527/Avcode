import passport from 'passport';
export const googleLogin = passport.authenticate('google', {
  scope: ['profile', 'email'],
  hd: 'mnit.ac.in', 
  prompt: 'select_account',
});
export const googleCallback = [
  passport.authenticate('google', {
    failureRedirect: '/auth/google',
    failureMessage: true,
    session: true,
  }),
  (req, res) => {
    if (req.user.roles.includes('student')) {
      res.redirect('http://localhost:5000/student/dashboard');
    } else {
      res.redirect('http://localhost:5000/dashboard');
    }
  },
];

export const getCurrentUser = (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not logged in' });
  }
  res.json(req.user); 
};
export const logout = (req, res) => {
 req.logout(err => {
  if (err) return next(err);
  req.session.destroy(err => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});
};