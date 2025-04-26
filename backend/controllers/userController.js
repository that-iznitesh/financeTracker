const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// @desc    Update user income
// @route   PUT /api/users/income
// @access  Private
const updateIncome = asyncHandler(async (req, res) => {
  const { income } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.income = income;
  await user.save();

  res.json({ message: "Income updated", income: user.income });
});

module.exports = { updateIncome };
