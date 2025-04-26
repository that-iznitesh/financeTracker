const asyncHandler =require("express-async-handler");
 const Expense =require("../models/expenseModel.js");
 const predictCategory = require("../utils/categoryAI");
 const User = require("../models/User");
// @desc    Get expense report
// @route   GET /api/expenses/report
// @access  Private
const sendEmail = require("../utils/sendEmail");

const addExpense = asyncHandler(async (req, res) => {
  const { title, amount, date } = req.body;


  if (!title || !amount) {
    return res.status(400).json({ message: "Title and Amount are required" });
  }

  // ✅ Predict category using title
  const category = await predictCategory(title); // ✅ Make sure this line uses await

  console.log("🔮 Predicted category:", category); // for debugging

  const expense = new Expense({
    user: req.user._id,
    title,
    amount,
    category,
    date: date || Date.now(),
  });

  const saved = await expense.save();
  res.status(201).json(saved);
});
const getExpenseReport = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  // 1️⃣ All expenses for user
  const expenses = await Expense.find({ user: userId }).sort({ date: -1 });

  // 2️⃣ Total Spending
  const totalSpent = await Expense.aggregate([
    { $match: { user: userId } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  // 3️⃣ Category-wise Breakdown
  const categoryWise = await Expense.aggregate([
    { $match: { user: userId } },
    { $group: { _id: "$category", total: { $sum: "$amount" } } }
  ]);

  // 4️⃣ Monthly Trend
  const monthlyTrend = await Expense.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" }
        },
        total: { $sum: "$amount" }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);
// email pe alert ke liye hai ye
  const alerts = [];
  categoryWise.forEach((c) => {
    const percent = (c.total / user.income) * 100;
    if (percent > 40) {
      alerts.push(`${c._id} - ${percent.toFixed(1)}% of your salary spent.`);
    }
  });

  if (alerts.length > 0) {
    await sendEmail(
      user.email,
      "⚠️ Spending Alert - Budget Exceeded",
      `Hi ${user.name},\n\nYou've exceeded your budget in these categories:\n\n${alerts.join(
        "\n"
      )}\n\n💡 Try to control expenses next month!\n\n— Smart Finance Tracker`
    );
  }

  // 5️⃣ Return full report including expenses array
  res.json({
    income: user?.income || 0,
    total_spent: totalSpent[0]?.total || 0,
    category_wise: categoryWise.map(c => ({ category: c._id, total: c.total })),
    monthly_trend: monthlyTrend.map(m => ({
      year: m._id.year,
      month: m._id.month,
      total: m.total
    })),
    expenses, // ✅ Add this line to fix frontend list update
  });
});
const getSmartSuggestions = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  const salary = user?.income || 0;

  const categoryExpenses = await Expense.aggregate([
    { $match: { user: user._id } },
    { $group: { _id: "$category", total: { $sum: "$amount" } } }
  ]);

  const totalSpent = categoryExpenses.reduce((sum, c) => sum + c.total, 0);
  const suggestions = [];

  if (salary && totalSpent > salary * 0.8) {
    suggestions.push(`⚠️ Your total expenses ₹${totalSpent} exceed 80% of your salary ₹${salary}`);
  }

  categoryExpenses.forEach((c) => {
    const percentage = (c.total / salary) * 100;
    if (percentage > 30) {
      suggestions.push(`📉 Try reducing spending on "${c._id}" (₹${c.total}), which is ${percentage.toFixed(1)}% of your income , which max up to equal to ${(30*salary)/100} rupes in this category`);
    }
    
  });
  if (totalSpent < salary * 0.8) {
    suggestions.push(`🎯 Great job! You’re saving money. Consider investing ₹${(salary * 0.1).toFixed(0)} to grow your wealth.`);
  }

  res.json({ suggestions });
});

    module.exports = {
        getExpenseReport,addExpense,getSmartSuggestions
      };
      