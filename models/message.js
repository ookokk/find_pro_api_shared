const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    messageId: { type: Number, unique: true }, 
    userId: { type: Number, required: true },
    otherUserId: { type: Number, required: true },
    message: { type: String, required: true },
    roomId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

messageSchema.pre("save", async function (next) {
    const doc = this;

    if (doc.isNew) { 
        try {
            const lastMessage = await mongoose.models.Message.findOne().sort({ messageId: -1 });
            doc.messageId = lastMessage ? lastMessage.messageId + 1 : 1; 
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

module.exports = mongoose.models.Message || mongoose.model("Message", messageSchema);
