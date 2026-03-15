let mongoose = require("mongoose");
let roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, "ten khong duoc rong"],
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);
module.exports = new mongoose.model("role", roleSchema);
