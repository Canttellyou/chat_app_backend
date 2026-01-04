import { Server as SocketIOServer, Socket } from "socket.io";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
export function registerChatEvents(io, socket) {
    socket.on("getConversations", async () => {
        console.log("getConversations event");
        try {
            const userId = socket.data.userId;
            if (!userId) {
                socket.emit("getConversations", {
                    success: false,
                    msg: "Unauthorized",
                });
                return;
            }
            // find conversations where the user is a participant
            const conversations = await Conversation.find({
                participants: userId,
            })
                .sort({ updatedAt: -1 })
                .populate({
                path: "lastMessage",
                select: "content senderId attachment createdAt",
            })
                .populate({
                path: "participants",
                select: "name avatar email",
            })
                .lean();
            socket.emit("getConversations", {
                success: true,
                data: conversations,
            });
        }
        catch (error) {
            console.log("getConversation error: ", error);
            socket.emit("getConversation", {
                success: false,
                msg: "Failed to get conversations",
            });
        }
    });
    socket.on("newConversation", async (data) => {
        console.log("newConversation event: ", data);
        try {
            if (data.type === "direct") {
                const existingConversation = await Conversation.findOne({
                    type: "direct",
                    participants: { $all: data.participants, $size: 2 },
                })
                    .populate({
                    path: "participants",
                    select: "name avatar email",
                })
                    .lean();
                if (existingConversation) {
                    socket.emit("newConversation", {
                        success: true,
                        data: { ...existingConversation, isNew: false },
                    });
                    return;
                }
            }
            const conversation = await Conversation.create({
                type: data.type,
                participants: data.participants,
                name: data.name || "",
                avatar: data.avatar || "",
                createdBy: socket.data.userId,
            });
            //   get all connected sockets
            const connectedSockets = Array.from(io.sockets.sockets.values()).filter((s) => data.participants.includes(s.data.userId));
            //   join this conversation by all online participants
            connectedSockets.forEach((participantSocket) => {
                participantSocket.join(conversation._id.toString());
            });
            // send conversation data back (populated)
            const populatedConversation = await Conversation.findById(conversation._id)
                .populate({
                path: "participants",
                select: "name avatar email",
            })
                .lean();
            if (!populatedConversation) {
                throw new Error("Failed to fetch conversation");
            }
            //   emit conversation to all participants
            io.to(conversation._id.toString()).emit("newConversation", {
                success: true,
                data: { ...populatedConversation, isNew: true },
            });
        }
        catch (error) {
            console.log("newConversation error: ", error);
            socket.emit("newConversation", {
                success: false,
                msg: "Failed to create conversation",
            });
        }
    });
    socket.on("newMessage", async (data) => {
        console.log("New Message event: ", data);
        try {
            const message = await Message.create({
                conversationId: data.conversationId,
                senderId: data.sender.id,
                content: data.content,
                attachment: data.attachment,
            });
            io.to(data.conversationId).emit("newMessage", {
                success: true,
                data: {
                    id: message._id,
                    content: data.content,
                    sender: {
                        id: data.sender.id,
                        name: data.sender.name,
                        avatar: data.sender.avatar,
                    },
                    attachment: data.attachment,
                    createdAt: new Date().toISOString(),
                    conversationId: data.conversationId,
                },
            });
            // update conversation's last message
            await Conversation.findByIdAndUpdate(data.conversationId, {
                lastMessage: message._id,
            });
        }
        catch (error) {
            console.log("newMessage error: ", error);
            socket.emit("newMessage", {
                success: false,
                msg: "Failed to send message",
            });
        }
    });
    // Getting Messages
    socket.on("getMessages", async (data) => {
        console.log("Get Message event: ", data);
        try {
            const messages = await Message.find({
                conversationId: data.conversationId,
            })
                .sort({ createdAt: -1 }) //newest
                .populate({
                path: "senderId",
                select: "name avatar",
            })
                .lean();
            const messagesWithSender = messages.map((message) => ({
                ...message,
                id: message._id,
                sender: {
                    id: message.senderId._id,
                    name: message.senderId.name,
                    avatar: message.senderId.avatar,
                },
            }));
            socket.emit("getMessages", { success: true, data: messagesWithSender });
        }
        catch (error) {
            console.log("getMessages error: ", error);
            socket.emit("getMessages", {
                success: false,
                msg: "Failed to fetch message",
            });
        }
    });
}
//# sourceMappingURL=chatEvents.js.map