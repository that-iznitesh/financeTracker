const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createGroup,
  getMyGroups,
  addMemberToGroup,
  deleteGroup,
  assignRoleToMember,
  removeMemberFromGroup,
  editGroup,
} = require("../controllers/groupController");

// 🔹 Create new group
router.post("/", protect, createGroup);

// 🔹 Get groups where user is a member
router.get("/my", protect, getMyGroups);

// 🔹 Add member to group (only by admin)
router.put("/:id/add-member", protect, addMemberToGroup);

// 🔹 Delete group (only admin can do)
router.delete("/:id", protect, deleteGroup);


router.put('/:groupId/members/:memberId/assign-role', protect, assignRoleToMember);

router.put("/:id/remove-member", protect, removeMemberFromGroup);
router.put("/:id/edit", protect, editGroup);

module.exports = router;
