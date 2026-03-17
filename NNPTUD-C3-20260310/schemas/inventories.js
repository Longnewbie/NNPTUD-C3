let mongoose = require("mongoose");
let inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      unique: true,
      required: [true, "Product is required"],
    },
    stock: {
      type: Number,
      min: [0, "Stock cannot be negative"],
    },
    reserved: {
      type: Number,
      min: [0, "Reserved cannot be negative"],
    },
    soldCount: {
      type: Number,
      min: [0, "Sold count cannot be negative"],
    },
  },
  {
    timestamps: true,
  },
);
module.exports = new mongoose.model("inventory", inventorySchema);
