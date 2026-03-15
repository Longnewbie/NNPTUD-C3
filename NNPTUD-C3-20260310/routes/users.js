var express = require("express");
var router = express.Router();
let userModel = require("../schemas/users");

// enable user
router.post("/enable", async function (req, res, next) {
  try {
    const { email, username } = req.body;

    const existingUser = await userModel.findOne({ email, username });
    if (existingUser) {
      existingUser.status = true;
    }

    await existingUser.save();

    res.status(200).json({ message: "User enabled!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// disable user
router.post("/disable", async function (req, res, next) {
  try {
    const { email, username } = req.body;

    const existingUser = await userModel.findOne({ email, username });
    if (existingUser) {
      existingUser.status = false;
    }

    await existingUser.save();

    res.status(200).json({ message: "User disabled!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// get all users
router.get("/", async function (req, res, next) {
  try {
    const users = await userModel.find({}).select("-password");
    res.json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// get user by id
router.get("/:id", async function (req, res, next) {
  try {
    const userById = userModel.findById(req.params.id);

    if (userById) {
      return res.status(404).json({
        message: "User not found!",
      });
    }

    res.status(200).json(userById);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// create user
router.post("/", async function (req, res, next) {
  try {
    const { username, password, email, fullName, avatarUrl, role } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({
        message: "Username, password and email are required!",
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists!",
      });
    }

    const user = new userModel({
      username,
      password,
      email,
      fullName,
      avatarUrl,
      role,
    });

    await user.save();

    res.status(200).json({ message: "User created successfully!", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// update user by id
router.put("/:id", async function (req, res, next) {
  try {
    const updatedUser = await userModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found!",
      });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// delete user by id
router.delete("/:id", async function (req, res, next) {
  try {
    const deletedUser = await userModel.findById(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({
        message: "User not found!",
      });
    }

    res.status(200).json({
      message: "User deleted successfully!",
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
