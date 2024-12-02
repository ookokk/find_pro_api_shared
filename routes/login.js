const express = require("express");
const router = express.Router();
const User = require("../models/user.js");


// Giriş için POST isteği
router.post("/", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user;
    if (email && password) {
      user = await User.findOne({ email, password }).select("-password -salt");
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid email or password",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Login successful!",
      user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Authentication failed",
    });
  }
});

router.post("/google", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, error: "Token is required." });

  try {
    const user = await User.findOne({ googleToken: token });
    if (!user) throw new Error("User not found or invalid Google token");

    return res.status(200).json({
      success: true,
      message: "Login successful with Google!",
      user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Login failed with Google",
    });
  }
});

router.post("/apple", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, error: "Token is required." });

  try {
    const user = await User.findOne({ appleToken: token });
    if (!user) throw new Error("User not found or invalid Apple token");

    return res.status(200).json({
      success: true,
      message: "Login successful with Apple!",
      user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Login failed with Apple",
    });
  }
});
module.exports = router;
