const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose"); // 👈 ye import zaruri hai
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

  // ✅ Validate memberId
  if (!mongoose.Types.ObjectId.isValid(memberId)) {
    res.status(400);
    throw new Error("Invalid member ID");
  }

  // Prevent duplicate addition
  const alreadyMember = group.members.find((m) => m.user.toString() === memberId);
  if (alreadyMember) {
    res.status(400);
    throw new Error("User is already a member");
  }

  // ✅ Push with ObjectId
  group.members.push({ 
    user: new mongoose.Types.ObjectId(memberId), 
    role: role || "member" 
  });

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


const assignRoleToMember = asyncHandler(async (req, res) => {
  const { groupId, memberId } = req.params;
  const { role } = req.body;

  const group = await Group.findById(groupId);

  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  // Check if requesting user is admin
  const isAdmin = group.members.find(
    (m) => m.user.toString() === req.user._id.toString() && m.role === "admin"
  );

  if (!isAdmin) {
    res.status(403);
    throw new Error('Only admin can assign roles');
  }

  const member = group.members.find((m) => m.user.toString() === memberId);

  if (!member) {
    res.status(404);
    throw new Error('Member not found');
  }

  // Update member role
  member.role = role;
  await group.save();

  res.json({ message: 'Role updated successfully' });
});

// 🔹 Remove a Member from Group
const removeMemberFromGroup = asyncHandler(async (req, res) => {
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
    throw new Error("Only admin can remove members");
  }

  const { memberId } = req.body;

  group.members = group.members.filter((m) => m.user.toString() !== memberId);

  await group.save();
  res.json({ message: "Member removed successfully" });
});

// 🔹 Edit Group (Name/Description)
const editGroup = asyncHandler(async (req, res) => {
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
    throw new Error("Only admin can edit group");
  }

  const { name, description } = req.body;
  if (name) group.name = name;
  if (description) group.description = description;

  await group.save();
  res.json({ message: "Group updated successfully" });
});


module.exports = {
  createGroup,
  getMyGroups,
  addMemberToGroup,
  deleteGroup,
  assignRoleToMember,
  removeMemberFromGroup,
  editGroup,
};
