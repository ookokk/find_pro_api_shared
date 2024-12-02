const express = require("express");
const router = express.Router();
const User = require("../models/user");
const multer = require("multer");
const upload = multer();


router.post("/", upload.none(), async (req, res) => {
  const { fullName, email, password, isMaster } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "All fields are required." });
  }

  try {
    const newUser = await User.create({
      fullName,
      email,
      password,
      isMaster,
    });

    return res.status(201).json({ 
      success: true, 
      message: "User registered successfully.",
      user: newUser
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "An error occurred while creating the user. Please try again." 
    });
  }
});

// GOOGLE
router.post("/google", upload.none(), async (req, res) => {
  const { token, email } = req.body;

  if (!token || !email) {
    return res.status(400).json({ success: false, error: "Token and email are required." });
  }

  try {
    const emailName = email.split("@")[0]; 
    const newUser = await User.create({
      password: token,
      googleToken: token,
      email: email,
      fullName: emailName,
    });
    return res.status(201).json({
      success: true,
      message: "User registered successfully with token and email.",
      user: newUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while registering the user.",
    });
  }
});

// APPLE
router.post("/apple", upload.none(), async (req, res) => {
  const { token, email } = req.body;

  if (!token || !email) {
    return res.status(400).json({ success: false, error: "Token and email are required." });
  }

  try {
    const emailName = email.split("@")[0]; 
    const newUser = await User.create({
      password: token,
      appleToken: token,
      email: email,
      fullName: emailName,
    });
    return res.status(201).json({
      success: true,
      message: "User registered successfully with token and email.",
      user: newUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while registering the user.",
    });
  }
});


module.exports = router;
