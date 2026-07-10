const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// @desc    Get all conversations for logged in user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .sort({ updatedAt: -1 })
      .populate("participants", "name email role avatar location verified");

    res.json({ data: conversations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or get existing conversation
// @route   POST /api/messages/conversation
// @access  Private
const createOrGetConversation = async (req, res) => {
  const { participantId, bookingId } = req.body;

  if (!participantId) {
    return res.status(400).json({ message: "Participant ID is required" });
  }

  try {
    // Find existing conversation between the two users
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, participantId],
        bookingId: bookingId || null,
        lastMessage: {
          text: "Conversation started",
          senderId: req.user._id,
          timestamp: new Date(),
        },
      });
    } else if (bookingId && !conversation.bookingId) {
      // Update booking association if newly provided
      conversation.bookingId = bookingId;
      await conversation.save();
    }

    const populatedConversation = await Conversation.findById(conversation._id).populate(
      "participants",
      "name email role avatar location verified"
    );

    res.status(200).json({ data: populatedConversation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all messages for a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
const getMessages = async (req, res) => {
  const { conversationId } = req.params;

  try {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.participants.includes(req.user._id.toString())) {
      return res.status(403).json({ message: "Not authorized to view these messages" });
    }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate("senderId", "name avatar role")
      .populate("receiverId", "name avatar role");

    res.json({ data: messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send message (HTTP fallback)
// @route   POST /api/messages/:conversationId
// @access  Private
const sendMessage = async (req, res) => {
  const { conversationId } = req.params;
  const { text, receiverId } = req.body;

  try {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.participants.includes(req.user._id.toString())) {
      return res.status(403).json({ message: "Not authorized to send messages here" });
    }

    const message = await Message.create({
      conversationId,
      senderId: req.user._id,
      receiverId,
      text,
    });

    conversation.lastMessage = {
      text,
      senderId: req.user._id,
      timestamp: new Date(),
    };
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "name avatar role")
      .populate("receiverId", "name avatar role");

    res.status(201).json({ data: populatedMessage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getConversations,
  createOrGetConversation,
  getMessages,
  sendMessage,
};
