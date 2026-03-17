const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user?.profile?.role) {
      return res.status(403).json({ success: false, message: 'Forbidden: no role assigned' });
    }

    if (!roles.includes(req.user.profile.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
    }

    next();
  };
};

export default authorizeRole;
