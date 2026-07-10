const express = require('express');
const router = express.Router();
const {
  createOrGetConversation,
  getConversations,
  getMessages,
  sendMessage,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/conversation', protect, createOrGetConversation);
router.get('/conversations', protect, getConversations);
router.get('/:conversationId', protect, getMessages);
router.post('/:conversationId', protect, sendMessage);

module.exports = router;
