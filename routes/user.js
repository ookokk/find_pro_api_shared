const { Router } = require("express");
const Message = require("../models/message"); 
const Room = require("../models/room");
const User = require("../models/user");
const path = require("path");
const fs = require("fs");
const router = Router();

// GET USER
router.post("/profile", async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching user details",  });
  }
});

// UPDATE PROFILE
router.post("/updateProfile", async (req, res) => {
  const { userId, fullName, ...updateData } = req.body;

  try {
    const user = await User.findOneAndUpdate({ userId }, updateData, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (fullName) {
      const updates = [
        Room.updateMany(
          { "hostProfile.userId": userId },
          { "hostProfile.fullName": fullName }
        ),
        Room.updateMany(
          { "guestProfile.userId": userId },
          { "guestProfile.fullName": fullName }
        )
      ];
      await Promise.all(updates);
    }
    return res.json({
      success: true,
      message: "User profile updated successfully across relevant collections",
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE PASSWORD
router.post("/updatePassword", async (req, res) => {
  const { userId, newPassword } = req.body;

  try {
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    user.password = newPassword;
    await user.save();
    return res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error updating password: " + error.message });
  }
});

//REMOVE ACCOUNT
router.post("/removeAccount", async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findOneAndDelete({ userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
  
    await Room.deleteMany({
      $or: [{ "hostProfile.userId": userId }, { "guestProfile.userId": userId }],
    });
    await Message.deleteMany({ senderId: userId });
    const uploadsDir = path.join(__dirname, "../uploads");
    const filesToDelete = [user.profilePicture, user.coverPicture];

    filesToDelete.forEach((fileName) => {
      if (fileName !== "profile.png" && fileName !== "cover.png") {
        const filePath = path.join(uploadsDir, fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    });

    return res.json({ success: true, message: "User account deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting user: " + error.message,
    });
  }
});


module.exports = router;
