// const express = require("express");
// const dotenv = require("dotenv");
// const connectDB = require("./config/db"); // ✅ Import connectDB
// const userRoutes = require("./routes/userRoutes");
// const { protect } = require("./middleware/authMiddleware");
// dotenv.config();
// connectDB(); // ✅ Call connectDB function

// // import { createRequire } from "module";
// const app = express();
// app.use(express.json());

// // Routes
// // app.use("/api/users", userRoutes);
// app.use("/api/users", require("./routes/userRoutes"));

// const expenseRoutes = require("./routes/expenseRoutes");
// app.use("/api/expenses", expenseRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const cors = require('cors');
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const { protect } = require("./middleware/authMiddleware");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Allow all origins (use cautiously in production)
app.use(cors());
// Routes
app.use("/api/users", userRoutes);
app.use("/api/expenses", expenseRoutes);

const bankRoutes = require("./routes/bankRoutes");
app.use("/api/bank", bankRoutes);

const groupRoutes = require("./routes/groupRoutes");
app.use("/api/groups", groupRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
