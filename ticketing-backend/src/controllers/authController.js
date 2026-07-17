const User = require("../models/User");
const generateToken = require("../utils/generateToken");



// POST /api/auth/signup
async function signup(req, res, next) {
  try {
    const { name, email, password, role } = req.body;


    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Name, email, password are all required");
    }


    const allowedSignupRoles = ["buyer", "seller"];
    const finalRole = allowedSignupRoles.includes(role) ? role : "buyer";
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409); // 409 = Conflict, the standard code for "already exists"
      throw new Error("An account with this email already exists");
    }


    const user = await User.create({ name, email, password, role: finalRole });

    const token = generateToken(user._id);


    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }


    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      res.status(401); // 401 = Unauthorized
      throw new Error("Invalid email or password");
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {

      res.status(401);
      throw new Error("Invalid email or password");
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}


async function getMe(req, res, next) {
  try {

    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { signup, login, getMe };