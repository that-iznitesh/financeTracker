const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Expense = require("../models/Expense");

const fs = require("fs");
const path = require("path");
const detectCategory = require("../utils/categoryAI");
 // Already created

const { getExpenseReport,addExpense ,getSmartSuggestions} =require("../controllers/expenseController.js");
router.get("/report", protect, getExpenseReport);

router.post("/add", protect, addExpense);         // ✅ addExpense used
       // ✅ getExpenses used

       router.get("/suggestions", protect, getSmartSuggestions);
       
// ✅ Add Expense Route (Protected)
// router.post("/add", protect, async (req, res) => {
//   try {
//     const { title, amount, category, date } = req.body;

//     if (!title || !amount || !category) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const expense = new Expense({
//       user: req.user._id, // Logged-in user ka ID
//       title,
//       amount,
//       category,
//       date: date || Date.now(),
//     });

//     const savedExpense = await expense.save();

//     res.status(201).json(savedExpense);
//   } catch (error) {
//     res.status(500).json({ message: "Error adding expense", error });
//   }
// });
router.post("/add", protect, async (req, res) => {
  try {
    const { title, amount, date } = req.body;

    if (!title || !amount) {
      return res.status(400).json({ message: "Title and amount are required" });
    }

    // 👇 Predict category using Flask API
    const category = await predictCategory(title);

    const expense = new Expense({
      user: req.user._id,
      title,
      amount,
      category,
      date: date || Date.now(),
    });

    const saved = await expense.save();
    res.status(201).json(saved);

  } catch (err) {
    console.error("Expense add failed:", err);
    res.status(500).json({ message: "Error adding expense", error: err });
  }
});
// phase 2 ka step 3 hai
// ✅ Get All Expenses Route (Protected)
router.get("/", protect, async (req, res) => {
    try {
      const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 }); // Latest expenses first
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Error fetching expenses", error });
    }
  });

  // ✅ Update Expense Route (Protected)
router.put("/:id", protect, async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;

    // Find the expense by ID
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Check if the logged-in user owns this expense
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to update this expense" });
    }

    // Update the expense details
    expense.title = title || expense.title;
    expense.amount = amount || expense.amount;
    expense.category = category || expense.category;
    expense.date = date || expense.date;

    const updatedExpense = await expense.save();
    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: "Error updating expense", error });
  }
});

//  phase 2 ka step 4 ka 1✅ Update Expense Route (Protected)
router.put("/:id", protect, async (req, res) => {
    try {
      const { title, amount, category, date } = req.body;
  
      // Find the expense by ID
      let expense = await Expense.findById(req.params.id);
  
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
  
      // Check if the logged-in user owns this expense
      if (expense.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: "Not authorized to update this expense" });
      }
  
      // Update the expense details
      expense.title = title || expense.title;
      expense.amount = amount || expense.amount;
      expense.category = category || expense.category;
      expense.date = date || expense.date;
  
      const updatedExpense = await expense.save();
      res.json(updatedExpense);
    } catch (error) {
      res.status(500).json({ message: "Error updating expense", error });
    }
  });
  
  // phase 2 step 5
  router.delete("/:id", protect, async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        // Check if the logged-in user owns the expense
        if (expense.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        await expense.deleteOne();
        res.json({ message: "Expense deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.get("/report", protect, getExpenseReport);

// Import Dummy Bank Transactions
router.post("/import-bank-transactions", protect,  async (req, res) => {
  try {
    const userId = req.user.id;

    const filePath = path.join(__dirname, "../data/dummyBankTransactions.json");
    const data = fs.readFileSync(filePath, "utf-8");
    const transactions = JSON.parse(data);

    const expensePromises = transactions.map(async (txn) => {
      const predictedCategory = await detectCategory(txn.title);

      return new Expense({
        user: userId,
        title: txn.title,
        amount: txn.amount,
        date: new Date(txn.date),
        category: predictedCategory || txn.category,
      });
    });

    const savedExpenses = await Promise.all(expensePromises);
    res.status(201).json({ message: "Transactions imported", data: savedExpenses });
  } catch (error) {
    console.error("Import error:", error);
    res.status(500).json({ message: "Failed to import bank transactions" });
  }
});

module.exports = router;
