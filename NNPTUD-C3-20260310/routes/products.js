var express = require("express");
var router = express.Router();
let productModel = require("../schemas/products");
let inventoryModel = require("../schemas/inventories");
const { default: slugify } = require("slugify");
const mongoose = require("mongoose");

// GET ALL INVENTORY
router.get("/inventory", async (req, res) => {
  try {
    const data = await inventoryModel.find().populate("product");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD STOCK
router.post("/inventory/add-stock", async (req, res) => {
  try {
    const { product, quantity } = req.body;

    if (!product || !quantity) {
      return res.status(400).json({ error: "product & quantity required" });
    }

    const inventory = await inventoryModel.findOne({ product });

    if (!inventory) {
      return res.status(404).json({ error: "Inventory not found" });
    }

    inventory.stock += quantity;

    await inventory.save();

    res.json(inventory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// REMOVE STOCK
router.post("/inventory/remove-stock", async (req, res) => {
  try {
    const { product, quantity } = req.body;

    const inventory = await inventoryModel.findOne({ product });

    if (!inventory) {
      return res.status(404).json({ error: "Inventory not found" });
    }

    if (inventory.stock < quantity) {
      return res.status(400).json({ error: "Not enough stock" });
    }

    inventory.stock -= quantity;

    await inventory.save();

    res.json(inventory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// RESERVE
router.post("/inventory/reserve", async (req, res) => {
  try {
    const { product, quantity } = req.body;

    const inventory = await inventoryModel.findOne({ product });

    if (!inventory) {
      return res.status(404).json({ error: "Inventory not found" });
    }

    if (inventory.stock < quantity) {
      return res.status(400).json({ error: "Not enough stock to reserve" });
    }

    inventory.stock -= quantity;
    inventory.reserved += quantity;

    await inventory.save();

    res.json(inventory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// SOLD
router.post("/inventory/sold", async (req, res) => {
  try {
    const { product, quantity } = req.body;

    const inventory = await inventoryModel.findOne({ product });

    if (!inventory) {
      return res.status(404).json({ error: "Inventory not found" });
    }

    if (inventory.reserved < quantity) {
      return res.status(400).json({ error: "Not enough reserved items" });
    }

    inventory.reserved -= quantity;
    inventory.soldCount += quantity;

    await inventory.save();

    res.json(inventory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET INVENTORY BY ID
router.get("/inventory/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const data = await inventoryModel
      .findById(req.params.id)
      .populate("product");

    if (!data) {
      return res.status(404).json({ error: "Inventory not found" });
    }

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============================
// PRODUCT ROUTES (ĐẶT SAU)
// ============================

// CREATE PRODUCT + AUTO CREATE INVENTORY
router.post("/", async (req, res) => {
  try {
    const product = new productModel({
      title: req.body.title,
      slug: slugify(req.body.title, { lower: true }),
      description: req.body.description,
      price: req.body.price,
      images: req.body.image,
      category: req.body.category,
    });

    const savedProduct = await product.save();

    // AUTO CREATE INVENTORY
    await inventoryModel.create({
      product: savedProduct._id,
      stock: 0,
      reserved: 0,
      soldCount: 0,
    });

    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET PRODUCT BY ID
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const product = await productModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE PRODUCT
router.put("/:id", async (req, res) => {
  try {
    const updated = await productModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!updated) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE PRODUCT
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await productModel.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
