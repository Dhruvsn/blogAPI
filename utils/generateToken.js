const jwt = require("jsonwebtoken");

async function generateToken(user) {
  const payload = {
    id: user.id,
    role: user.role,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
}

async function generateRefreshToken(user) {
  const payload = { id: user.id };
  return jwt.sign(payload, process.env.REFRESH_TOKEN, {
    expiresIn: "7d",
  });
}

module.exports = {
  generateToken,
  generateRefreshToken,
};
