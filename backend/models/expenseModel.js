const mongoose =require("mongoose");

const expenseSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Yeh "User" model se reference lega
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please enter expense title"],
    },
    amount: {
      type: Number,
      required: [true, "Please enter expense amount"],
    },
    category: {
      type: String,
      required: [true, "Please enter expense category"],
      // enum: ["Food", "Transport", "Health", "Entertainment", "Others","Cloth"], // Specific categories
    },
    date: {
      type: Date,
      required: true,
    },
    transaction_id:
     { type: String, unique: true, sparse: true },

  },
  {
    timestamps: true, // Yeh createdAt & updatedAt fields add karega
  }
);

// ✅ OverwriteModelError se bachne ke liye ye check kar: 
const Expense = mongoose.models.Expense || mongoose.model("Expense", expenseSchema);
  

module.exports= Expense;
