const jwt = require("jsonwebtoken");
const dbStore = require("../models/supabaseAdapter");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Directly query from the store to avoid chainable issues
    const users = await dbStore.table("users").select();
    const user = users.find((u) => u._id === decoded.id || u.id === decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: "This account has been deactivated" });
    }

    // Attach user without password
    const { password: _, ...safeUser } = user;
    req.user = { ...safeUser, _id: safeUser._id || safeUser.id };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ code: "TOKEN_EXPIRED", message: "Token has expired" });
    }
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user?.role || "unknown"}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
