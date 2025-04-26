const express = require("express");
const router = express.Router();
const plaidClient = require("../config/plaidClient");
const { protect } = require("../middleware/authMiddleware");
const User =require("../models/User");
const Expense = require("../models/Expense");
router.post("/create_link_token", protect, async (req, res) => {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: req.user._id.toString() },
      client_name: "Smart Finance Tracker",
      products: ["transactions"],
      country_codes: ["US"],
      language: "en",
    });

    res.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error("Link Token Error:", error);
    res.status(500).json({ error: "Failed to create link token" });
  }
});
router.post("/exchange_public_token", protect, async (req, res) => {

  try {
    const { public_token } = req.body;
    const plaid = require("../config/plaidClient");

    const tokenResponse = await plaid.itemPublicTokenExchange({
      public_token,
    });

    const access_token = tokenResponse.data.access_token;
    console.log("Access token received hua bhai:", req.body.accessToken);

    // ✅ Save to user record
    const user = await User.findById(req.user._id);
    user.access_token = access_token;
    await user.save();

    res.json({ message: "Access token saved" });
  } catch (error) {
    console.error("Exchange error:", error);
    res.status(500).json({ error: "Failed to exchange token" });
  }
});
router.post("/pull_transactions", protect, async (req, res) => {

  try {
    const user = await User.findById(req.user._id);
    const access_token = user.access_token;

    if (!access_token) {
      return res.status(400).json({ error: "No access token found" });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const plaid = require("../config/plaidClient");

    const response = await plaid.transactionsGet({
      access_token,
      start_date: thirtyDaysAgo.toISOString().split("T")[0],
      end_date: now.toISOString().split("T")[0],
    });

    const transactions = response.data.transactions;

    console.log("Fetched", transactions.length, "transactions");

    const predictCategory = require("../utils/categoryAI");

    // const bulkOps = transactions.map((txn) => ({
    //   updateOne: {
    //     filter: { transaction_id: txn.transaction_id },
    //     update: {
    //       $setOnInsert: {
    //         user: req.user._id,
    //         title: txn.name,
    //         amount: txn.amount,
    //         date: txn.date,
    //         category: predictCategory(txn.name),
    //         transaction_id: txn.transaction_id,
    //       },
    //     },
    //     upsert: true,
    //   },
    // }));
    const bulkOps = await Promise.all(
      transactions.map(async (txn) => ({
        updateOne: {
          filter: { transaction_id: txn.transaction_id },
          update: {
            $setOnInsert: {
              user: req.user._id,
              title: txn.name,
              amount: txn.amount,
              date: txn.date,
              category: await predictCategory(txn.name), // ✅ awaited properly
              transaction_id: txn.transaction_id,
            },
          },
          upsert: true,
        },
      }))
    );    
    await Expense.bulkWrite(bulkOps);

    res.json({ message: "Transactions imported", count: transactions.length });
  } catch (error) {
  console.error("Error pulling transactions:", error.response ? error.response.data : error.message);
  res.status(500).json({ error: "Failed to fetch transactions" });
}

});

module.exports = router;
