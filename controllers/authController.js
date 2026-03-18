const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { saveUser, findUser, findUserById } = require("../models/userModel.js");
const { validateEmail } = require("../utils/validateors.js");
const { saveRefreshToken } = require("../models/tokenModel.js");
const {
  generateToken,
  generateRefreshToken,
} = require("../utils/generateToken.js");

// Register controller flow

// 1. get username/email/password from request
// validate input
//      -  check missing fields
//      -  check email format
//      - check password length

// check if email already exists
// hash password
// insert user into db
// return success response

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All user credentials are required",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "Invalid email format!",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long!",
      });
    }

    const existingUser = await findUser(email);
    console.log(existingUser);
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists!" });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.SALT_ROUNDS) || 10,
    );
    const newUser = await saveUser(username, email, hashedPassword);

    res.status(201).json({
      message: "User registered successfully!",
      user: newUser, // or newUser
    });
  } catch (err) {
    console.error("error:", err.message);
    res.status(500).json({
      message: "Server error. Please try again later.",
    });
  }
};

// LOGIN FLOW
// 1. get email/password from request
// 2. validate input
//      . check missing fields
//      -  check email format
//      - check password length
// 3. find the user by email
// 4. compare password using bcrypt
// 5. generate jwt token
// 6. return token to client.

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "All credentials are required!",
      });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "Invalid email format!",
      });
    }
    const user = await findUser(email);
    if (!user) {
      return res.status(401).json({
        message: "user not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // generate jwt token
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    await saveRefreshToken(refreshToken, user);

    await res.status(200).json({
      message: "Login successful!",
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      message: "Server error.",
    });
  }
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      message: "Refresh token is required!",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
    const user = findUserById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({
        message: "Invalid refresh token!",
      });
    }

    const newToken = generateToken(user);

    res.status(200).json({
      token: newToken,
    });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(403).json({
      message: "Invalid refresh token!",
    });
  }
};

const logoutUser = async (req, res) => {
  const userId = parseInt(req.user.id);
  if (isNaN(userId)) {
    return res.status(400).json({
      message: "Invalid user id!",
    });
  }

  try {
    const id = userId;
    await saveRefreshToken(null, id);
    res.status(200).json({
      message: "Logout successful!",
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({
      message: "Server error.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
};
