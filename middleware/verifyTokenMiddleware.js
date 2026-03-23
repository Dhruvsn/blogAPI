// JWT Middleware Flow

// get auth header
// check if header exists
// extract token from "Bearer TOKEN"
// verify token using JWT_SECRET
// decode payload to req.user
// attach payload to req.user
// call next()

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    // 1 get authorization header
    const authHeader = req.headers.authorization;

    // 2 check if header exists
    if (!authHeader) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }

    // 3 check Bearer format
    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        message: "Invalid authorization format",
      });
    }

    // 4 extract token
    const token = parts[1];

    // 5 verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({
        message: "Invalid token!",
      });
    }

    // 6 attach user info to request
    req.user = decoded;

    // 7 move to next middleware/controller
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = verifyToken;
