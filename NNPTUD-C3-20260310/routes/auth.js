const express = require("express");
const router = express.Router();
const userModel = require("../schemas/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const privateKey = fs.readFileSync("./keys/private.key");
const publicKey = fs.readFileSync("./keys/public.key");

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log(req.body);

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const user = await userModel.findOne({
      username: username,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid username",
      });
    }

    const checkPassword = bcrypt.compareSync(password, user.password);

    if (!checkPassword) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      privateKey,
      {
        algorithm: "RS256",
        expiresIn: "1d",
      },
    );

    res.json({
      message: "Login success",
      token: token,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      message: "Token required",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    });

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
}

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// =============================
// CHANGE PASSWORD
// =============================
router.post("/changePassword", verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Old password and new password required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const checkPassword = bcrypt.compareSync(oldPassword, user.password);

    if (!checkPassword) {
      return res.status(400).json({
        message: "Old password incorrect",
      });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;
