const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Token extract karo
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user from decoded token and exclude password
      req.user = await User.findById(decoded.id).select("-password");

      next(); // Move to next middleware or route
    } catch (error) {
      res.status(401).json({ message: "Not authorized, invalid token" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };
