const { Router } = require("express");
const Room = require("../models/room");
const User = require("../models/user");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const router = Router();

const defaultImages = ["profile.png", "cover.png"]; 

// PROFILE PICTURE
router.post("/profilePicture", async (req, res) => {
    try {
        const { userId, image } = req.body;

        if (!image || !userId) {
            return res.status(400).json({ success: false, message: "Image and userId are required" });
        }

        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.profilePicture && !defaultImages.includes(user.profilePicture)) {
            const oldPath = path.join(__dirname, "../uploads", user.profilePicture);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }
        const uniqueFileName = `${uuidv4()}.jpg`;
        const uploadPath = path.join(__dirname, "../uploads", uniqueFileName);
        const buffer = Buffer.from(image, "base64");
        fs.writeFileSync(uploadPath, buffer);
        user.profilePicture = uniqueFileName;
        await user.save();
        const updatedProfilePicture = uniqueFileName;

        await Room.updateMany(
            { "hostProfile.userId": userId },
            { $set: { "hostProfile.profilePicture": updatedProfilePicture } }
        );
        await Room.updateMany(
            { "guestProfile.userId": userId },
            { $set: { "guestProfile.profilePicture": updatedProfilePicture } }
        );
        return res.json({
            success: true,
            message: "Profile image updated across all models",
            user,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || "Error uploading profile image" });
    }
});

module.exports = router;
