const jwt = require("jsonwebtoken");
const dbStore = require("../models/supabaseAdapter");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const initSocket = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const users = await dbStore.table("users").select();
      const rawUser = users.find((u) => u._id === decoded.id || u.id === decoded.id);

      if (!rawUser) {
        return next(new Error("Authentication error: User not found"));
      }

      if (rawUser.isActive === false) {
        return next(new Error("Authentication error: Account deactivated"));
      }

      const { password: _, ...safeUser } = rawUser;
      socket.user = { ...safeUser, _id: safeUser._id || safeUser.id };
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket Connected: User ${socket.user.name} (${socket.id})`);

    // Join room for the user to receive private direct notifications or online statuses
    socket.join(socket.user._id.toString());

    // Join a conversation room
    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.user.name} joined conversation room: ${conversationId}`);
    });

    // Send a message real-time
    socket.on("send_message", async ({ conversationId, receiverId, text }) => {
      try {
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
          return socket.emit("error_occurred", "Conversation not found");
        }

        if (!conversation.participants.includes(socket.user._id.toString())) {
          return socket.emit("error_occurred", "Unauthorized to send messages in this conversation");
        }

        // Create and save message
        const message = await Message.create({
          conversationId,
          senderId: socket.user._id,
          receiverId,
          text,
        });

        // Update conversation's last message details
        conversation.lastMessage = {
          text,
          senderId: socket.user._id,
          timestamp: new Date(),
        };
        await conversation.save();

        const populatedMessage = await Message.findById(message._id)
          .populate("senderId", "name avatar role")
          .populate("receiverId", "name avatar role");

        // Broadcast to all participants inside the conversation room
        io.to(conversationId).emit("message_received", populatedMessage);

        // Also notify the receiver's private room to update their conversation list if not actively in room
        socket.to(receiverId).emit("conversation_updated", {
          conversationId,
          lastMessage: {
            text,
            timestamp: message.createdAt,
          },
        });
      } catch (error) {
        console.error("Socket send_message error:", error.message);
        socket.emit("error_occurred", "Failed to send message");
      }
    });

    // Handle typing start indicator
    socket.on("typing", ({ conversationId }) => {
      socket.to(conversationId).emit("user_typing", {
        userId: socket.user._id,
        conversationId,
      });
    });

    // Handle typing stop indicator
    socket.on("stop_typing", ({ conversationId }) => {
      socket.to(conversationId).emit("user_stop_typing", {
        userId: socket.user._id,
        conversationId,
      });
    });

    // Handle mark read status
    socket.on("mark_read", async ({ conversationId }) => {
      try {
        await Message.updateMany(
          { conversationId, receiverId: socket.user._id, isRead: false },
          { isRead: true }
        );
        socket.to(conversationId).emit("messages_read", { conversationId });
      } catch (error) {
        console.error("Socket mark_read error:", error.message);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket Disconnected: User ${socket.user.name} (${socket.id})`);
    });
  });
};

module.exports = initSocket;
