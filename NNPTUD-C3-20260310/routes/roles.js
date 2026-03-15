var express = require("express");
var router = express.Router();
let userModel = require("../schemas/users");
let roleModel = require("../schemas/roles");

// get all users by id of role
router.get("/:id/users", async function (req, res, next) {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: "Role id is required" });
    }

    const usersByRole = await userModel.find({ role: req.params.id });
    res.json(usersByRole);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// create role
router.post("/", async function (req, res, next) {
  try {
    const role = new roleModel({
      name: req.body.name,
      description: req.body.description,
    });
    const saved = await role.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// get all roles
router.get("/", async function (req, res, next) {
  try {
    const roles = await roleModel.find({});
    res.json(roles);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// get role by id
router.get("/:id", async function (req, res, next) {
  try {
    const roleById = await roleModel.findById(req.params.id);
    res.json(roleById);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// update role by id
router.put("/:id", async function (req, res, next) {
  try {
    const { name, description } = req.body;
    const id = req.params.id;

    const updated = await roleModel.findByIdAndUpdate(
      id,
      { name, description },
      {
        new: true,
      },
    );
    if (!updated) return res.status(404).json({ error: "Role not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// delete role by id
router.delete("/:id", async function (req, res, next) {
  try {
    const deleted = await roleModel.findById(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Role not found" });

    res.json({ message: "Role deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
