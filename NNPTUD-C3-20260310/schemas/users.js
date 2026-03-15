let mongoose = require("mongoose");
let userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: [true, "ten khong duoc rong"],
    },
    password: {
      type: String,
      unique: true,
      required: [true, "mat khau khong duoc rong"],
    },
    email: {
      type: String,
      default: "",
    },
    fullName: {
      type: String,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: "https://i.sstatic.net/l60Hf.png",
    },
    status: {
      type: Boolean,
      default: false,
    },
    role: {
      type: mongoose.Types.ObjectId,
      ref: "role",
    },
    loginCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);
module.exports = new mongoose.model("user", userSchema);
