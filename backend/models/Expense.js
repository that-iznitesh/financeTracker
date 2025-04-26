const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Ye User Model ke saath link karega
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Other", "Cloth"], // Fixed categories
    },
    date: {
      type: Date,
      default: Date.now,
    },
    transaction_id: {
      type: String,
      default: null,
    },
  },
  { timestamps: true } // Automatically createdAt & updatedAt add karega
);

const Expense = mongoose.model("Expense", ExpenseSchema);

module.exports = Expense;
