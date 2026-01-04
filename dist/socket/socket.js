import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Server as SocketIOServer, Socket } from "socket.io";
import { registerUserEvents } from "./userEvents.js";
import { registerChatEvents } from "./chatEvents.js";
import Conversation from "../models/Conversation.js";
dotenv.config();
export function initializeSocketServer(server) {
    const io = new SocketIOServer(server, {
        cors: {
            origin: "*",
        },
    });
    // auth middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication error: Token not provided"));
        }
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return next(new Error("Authentication error: Invalid token"));
            }
            // Attach decoded user info to socket object
            let userData = decoded.user;
            socket.data = userData;
            socket.data.userId = userData.id;
            next();
        });
    });
    io.on("connection", async (socket) => {
        const userId = socket.data.userId;
        console.log(`User connected: ${userId}, username: ${socket.data.name}`);
        // register events
        registerChatEvents(io, socket);
        registerUserEvents(io, socket);
        // join all the conversations the user is part of
        try {
            const conversations = await Conversation.find({
                participants: userId,
            }).select("_id");
            conversations.forEach((conversation) => {
                socket.join(conversation._id.toString());
            });
        }
        catch (error) {
            console.log("Error joining conversations");
        }
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${userId}`);
        });
    });
    return io;
}
//# sourceMappingURL=socket.js.map