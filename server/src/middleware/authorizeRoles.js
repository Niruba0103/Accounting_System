const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Check global role or company-specific role
      const userRole = req.userCompanyRole || req.user.role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      next();
    } catch (error) {
      console.error('Role authorization error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
};

module.exports = authorizeRoles;