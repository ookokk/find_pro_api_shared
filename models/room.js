const { Schema, model } = require("mongoose");

const roomSchema = new Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
    },
    hostProfile: {
      fullName: { type: String},
      userId: {
        type: Number,
        required: true,
      },
      profilePicture: { type: String, required: true},
      roomId: { type: String, required: true }, 
    },
    guestProfile: {
      fullName: { type: String},
      profilePicture: { type: String, required: true },
      userId: {
        type: Number,
        required: true,
      },
      roomId: { type: String, required: true },  
    },
    createdAt: {
      type: Date,
      default: Date.now,
    }
  }
);

const Room = model("Room", roomSchema);

module.exports = Room;
