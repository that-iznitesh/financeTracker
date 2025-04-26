// routes/expenses.js
router.post("/sync", protect, async (req, res) => {
    try {
      const dummyExpenses = [
        { title: "Zomato", amount: 300, category: "Food", date: new Date(), user: req.user._id },
        { title: "Uber", amount: 150, category: "Travel", date: new Date(), user: req.user._id },
        { title: "Amazon", amount: 800, category: "Shopping", date: new Date(), user: req.user._id },
      ];
  
      await Expense.insertMany(dummyExpenses);
      res.status(200).json({ message: "Bank data synced successfully!" });
    } catch (err) {
      res.status(500).json({ message: "Failed to sync bank data", error: err });
    }
  });
  