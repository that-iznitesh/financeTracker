const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createGroup,
  getMyGroups,
  addMemberToGroup,
  deleteGroup,
} = require("../controllers/groupController");

// 🔹 Create new group
router.post("/", protect, createGroup);

// 🔹 Get groups where user is a member
router.get("/my", protect, getMyGroups);

// 🔹 Add member to group (only by admin)
router.put("/:id/add-member", protect, addMemberToGroup);

// 🔹 Delete group (only admin can do)
router.delete("/:id", protect, deleteGroup);

module.exports = router;
