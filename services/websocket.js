const WebSocket = require("ws");
const Message = require("../models/message");
const Room = require("../models/room");
const User = require("../models/user");

const rooms = {}; 

const initWebsocketServer = (server) => {
    const wss = new WebSocket.Server({ noServer: true });

    server.on('upgrade', (request, socket, head) => {
        if (request.url.startsWith('/socket/')) {
            const roomId = request.url.split('/')[2];
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, roomId);
            });
        } else {
            socket.destroy();
        }
    });

    wss.on("connection", async (ws, roomId) => {
        console.log("Client connected to room:", roomId);

        if (!rooms[roomId]) {
            rooms[roomId] = { clients: [], users: {} };
        }
        
        const userIds = roomId.split('_').map(id => parseInt(id, 10));
        const users = await User.find({ userId: { $in: userIds } });
    
        let room = await Room.findOne({ roomId });
        if (!room) {
            room = new Room({
                roomId,
                hostProfile: { 
                    fullName: users[0]?.fullName || "host",
                    userId: users[0]?.userId || 1,
                    profilePicture: users[0]?.profilePicture, 
                    roomId: roomId,  
                },
                guestProfile: {
                    fullName: users[1]?.fullName || "guest", 
                    userId: users[1]?.userId || 2,      
                    profilePicture: users[1]?.profilePicture, 
                    roomId: roomId, 
                }
            });
            await room.save();
        }
    

        const previousMessages = await Message.find({ roomId }).sort({ timestamp: 1 });
        ws.send(JSON.stringify({ action: "loadMessages", messages: previousMessages }));

        if (!rooms[roomId]) {
            rooms[roomId] = { clients: [], users: {} };
        }

        rooms[roomId].clients.push(ws);

        ws.on("message", async (data) => {
            const parsedData = JSON.parse(data);
            
            if (parsedData.action === "sendMessage") {
                const { message, userId, otherUserId } = parsedData;
                
                const newMessage = new Message({
                    roomId,  
                    userId,
                    otherUserId,
                    message,
                    timestamp: new Date(),
                });
            
                await newMessage.save();
                
                rooms[roomId].clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ action: "receiveMessage", message: newMessage }));
                    }
                });
            }
        });

    
        ws.on("close", () => {
            console.log(`User disconnected from room ${roomId}`);
            rooms[roomId].clients = rooms[roomId].clients.filter(client => client !== ws);
            if (rooms[roomId].clients.length === 0) {
                delete rooms[roomId];
            }
        });
    });
};

module.exports = { initWebsocketServer };
