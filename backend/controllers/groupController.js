const asyncHandler = require("express-async-handler");
const Group = require("../models/groupModel");
const User = require("../models/User");

// 🔹 Create a Group
const createGroup = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const group = new Group({
    name,
    description,
    createdBy: req.user._id,
    members: [{ user: req.user._id, role: "admin" }],
  });

  const savedGroup = await group.save();
  res.status(201).json(savedGroup);
});

// 🔹 Get Groups user is part of
const getMyGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({ "members.user": req.user._id }).populate("members.user", "name email");
  res.json(groups);
});

// 🔹 Add Member to Group
const addMemberToGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    res.status(404);
    throw new Error("Group not found");
  }

  const isAdmin = group.members.find(
    (m) => m.user.toString() === req.user._id.toString() && m.role === "admin"
  );

  if (!isAdmin) {
    res.status(403);
    throw new Error("Only admin can add members");
  }

  const { memberId, role } = req.body;

  // Prevent duplicate addition
  const alreadyMember = group.members.find((m) => m.user.toString() === memberId);
  if (alreadyMember) {
    res.status(400);
    throw new Error("User is already a member");
  }

  group.members.push({ user: memberId, role: role || "member" });
  await group.save();

  res.json({ message: "Member added successfully" });
});

// 🔹 Delete Group
const deleteGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    res.status(404);
    throw new Error("Group not found");
  }

  if (group.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Only the creator can delete the group");
  }

  await group.deleteOne();
  res.json({ message: "Group deleted" });
});

module.exports = {
  createGroup,
  getMyGroups,
  addMemberToGroup,
  deleteGroup,
};
