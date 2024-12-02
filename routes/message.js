const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Room = require("../models/room"); 
const Message = require("../models/message");
const { rooms } = require("../services/websocket");

router.post("/chatRooms", async (req, res) => {
  const { userId } = req.body;

  try {
    const roomsInDb = await Room.find({
      $or: [
        { "hostProfile.userId": Number(userId) },
        { "guestProfile.userId": Number(userId) }
      ]
    });

    if (!roomsInDb.length) {
      return res.json({ success: false, message: "No rooms found", rooms: [] });
    }

    const rooms = roomsInDb.map(room => ({
      roomId: room.roomId,
      hostProfile: {
        fullName: room.hostProfile.fullName,
        userId: room.hostProfile.userId,
        profilePicture: room.hostProfile.profilePicture,
        roomId: room.hostProfile.roomId,
      },
      guestProfile: {
        fullName: room.guestProfile.fullName,
        profilePicture: room.guestProfile.profilePicture,
        userId: room.guestProfile.userId,
        roomId: room.guestProfile.roomId,
      }
    }));

    res.json({ success: true, message: "Rooms found", rooms });
  } catch (error) {
    console.error("Error retrieving chat rooms:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});




router.post("/startChatRoom", async (req, res) => {
  const { userId, otherUserId } = req.body;

  if (userId === otherUserId) {
    return res.json({ success: false, message: "User IDs cannot be the same" });
  }

  const roomId = [userId, otherUserId].sort((a, b) => a - b).join("_");

  try {
    let room = await Room.findOne({ roomId });
    if (room) {
      
      return res.json({ 
        success: false, 
        roomId, 
        message: "Room already exists"
      });
    }

    const hostId = Math.min(userId, otherUserId);
    const guestId = Math.max(userId, otherUserId);

    const host = await User.findOne({ userId: hostId });
    const guest = await User.findOne({ userId: guestId });

    if (!host || !guest) {
      return res.json({ success: false, message: "User not found" });
    }

    room = new Room({
      roomId,
      hostProfile: {
        fullName: host.fullName,
        userId: host.userId,
        profilePicture: host.profilePicture,
        roomId: roomId,
      },
      guestProfile: {
        fullName: guest.fullName,
        userId: guest.userId,
        profilePicture: guest.profilePicture,
        roomId: roomId,
      },
    });

    await room.save();
    if (!global.rooms) {
      global.rooms = {};
    }
    if (!rooms[roomId]) {
      rooms[roomId] = [];
  }
    rooms[roomId] = rooms[roomId] || [];
    res.json({ success: true, roomId, message: "Chat room created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
});

router.post("/deleteRoom", async (req, res) => {
  const { roomId } = req.body;

  if (!roomId) {
    return res.status(400).json({ success: false, message: "Room ID is required" });
  }

  try {
    const deletedRoom = await Room.findOneAndDelete({ roomId });
    if (!deletedRoom) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }
    const deletedMessages = await Message.deleteMany({ roomId });

    if (rooms[roomId]) {
      rooms[roomId].clients.forEach(client => client.close());
      delete rooms[roomId];
    }

    res.json({
      success: true,
      message: `Room and ${deletedMessages.deletedCount} messages deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting room and messages:", error.message);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
});


module.exports = router;
