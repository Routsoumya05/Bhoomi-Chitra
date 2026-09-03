function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '401 Unauthorized: Please log in to access this resource.'
      });
    }

    const userRole = req.user.roleCode;

    // Public users strictly prohibited from all administrative routes
    if (userRole === 'PUBLIC_USER') {
      return res.status(403).json({
        success: false,
        error: '403 Forbidden: Public users are strictly read-only and cannot access administrative resources or actions.'
      });
    }

    // SYS_ADMIN has override access unless explicitly constrained
    if (userRole === 'SYS_ADMIN') {
      return next();
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: `403 Forbidden: Role '${userRole}' is not authorized to perform this operation. Required role(s): ${allowedRoles.join(', ')}.`
      });
    }

    next();
  };
}

function blockPublicMutations(req, res, next) {
  if (req.user && req.user.roleCode === 'PUBLIC_USER') {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return res.status(403).json({
        success: false,
        error: '403 Forbidden: Public users are strictly read-only. Mutation operations are prohibited.'
      });
    }
  }
  next();
}

module.exports = {
  requireRole,
  blockPublicMutations
};
