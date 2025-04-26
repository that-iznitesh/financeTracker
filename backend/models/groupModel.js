const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,

  members: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      role: {
        type: String,
        enum: ["admin", "member"],
        default: "member",
      },
    },
  ],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Group = mongoose.model("Group", groupSchema);
module.exports = Group;
