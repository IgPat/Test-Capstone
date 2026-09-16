// Restricts a route to specific roles, e.g. requireRole('admin')
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
  }
  next();
};

// Allows an admin OR the student who owns the resource (req.params.id matches
// their linked studentProfile) to proceed. Used on "view/update own record" routes.
const requireAdminOrOwner = (getOwnerStudentProfileId) => async (req, res, next) => {
  if (req.user.role === 'admin') return next();

  try {
    const ownerId = await getOwnerStudentProfileId(req);
    if (ownerId && req.user.studentProfile && ownerId.toString() === req.user.studentProfile.toString()) {
      return next();
    }
    return res.status(403).json({ message: 'Forbidden: you can only access your own records' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error checking ownership' });
  }
};

module.exports = { requireRole, requireAdminOrOwner };
