const jwt = require("jsonwebtoken");

function generateToken(user) {
  const payload = {
    id: user.id,
    role: user.role,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
}

function generateRefreshToken(user) {
  const payload = { id: user.id };
  return jwt.sign(payload, process.env.REFRESH_TOKEN, {
    expiresIn: "7d",
  });
}

module.exports = {
  generateToken,
  generateRefreshToken,
};
