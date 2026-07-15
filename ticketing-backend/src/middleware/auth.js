const jwt = require("jsonwebtoken");
const User = require("../models/User");


async function protect(req, res, next) {
  try {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      res.status(401);
      throw new Error("Not authorized — no token provided");
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401);
      throw new Error("Not authorized — user no longer exists");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    next(new Error("Not authorized — invalid or expired token"));
  }
}


function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403); 
      return next(new Error(`Role '${req.user.role}' is not permitted to do this`));
    }
    next();
  };
}

module.exports = { protect, authorize };