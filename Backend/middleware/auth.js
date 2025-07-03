export const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized. Please log in." });
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRoles = req.user.roles || [];
    const isAuthorized = allowedRoles.some(role => userRoles.includes(role));

    if (!isAuthorized) {
      return res.status(403).json({ message: "Forbidden. Access denied." });
    }

    next();
  };
};

