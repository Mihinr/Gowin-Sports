/**
 * Middleware to protect admin routes
 */
function adminRequired(req, res, next) {
  if (!req.session || !req.session.adminToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

module.exports = {
  adminRequired
};

