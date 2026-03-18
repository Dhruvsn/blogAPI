const jwt = require("jsonwebtoken");

const optionalAuth = (req, res, next) => {
  const header = req.header["authorization"];

  if (!header) {
    return next(); // no user -> public access
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.user = decoded;
  } catch (err) {
    // ignore invalid token -> treat as public
  }

  next();
};

module.exports = optionalAuth;
