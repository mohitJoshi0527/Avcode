import passport from 'passport';
export const googleLogin = passport.authenticate('google', {
  scope: ['profile', 'email'],
  hd: 'mnit.ac.in', 
  prompt: 'select_account',
});
export const googleCallback = [
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: true,
  }),
  (req, res) => {
    res.redirect('/success');
  }
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