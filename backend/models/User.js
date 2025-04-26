const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// User Schema
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensure email is unique
    },
    password: {
      type: String,
      required: true,
    },
    income: {
      type: Number,
      default: 0,
    },
    access_token: {
       type: String
       },

  },
  { timestamps: true } // Automatically add createdAt & updatedAt fields
);

// Password Hashing Middleware (Before saving user)
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords (for login)
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create User Model
const User = mongoose.model("User", UserSchema);

module.exports = User;
