const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const router = express.Router();
const { updateIncome } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.put("/income", protect, updateIncome);

// Signup Route (User Registration)
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user
    const user = await User.create({ name, email, password });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d", // Token valid for 30 days
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
});

// ✅ Login Route (User Authentication)
router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if user exists
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
  
      // Match password
      const isMatch = await user.matchPassword(password);
  
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
  
      // Generate JWT Token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });
  
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token,
      });
    } catch (error) {
      res.status(500).json({ message: "Error logging in", error });
    }
  });

  // ✅ Protected Route: User Profile (JWT Required)
router.get("/profile", protect, async (req, res) => {
    res.json({ message: "Protected Route Accessed", user: req.user });
  });


module.exports = router;
