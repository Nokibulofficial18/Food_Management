import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  sendMessage,
  getConversation,
  getConversations,
  createConversation,
  removeConversation,
  getChatbotInfo
} from '../controllers/chatbotController.js';

const router = express.Router();

/**
 * @route   GET /api/chatbot/info
 * @desc    Get NourishBot information and capabilities
 * @access  Public
 */
router.get('/info', getChatbotInfo);

/**
 * @route   POST /api/chatbot/message
 * @desc    Send message to NourishBot and receive response
 * @access  Private
 * @body    { userMessage: String, sessionId?: String }
 */
router.post('/message', authenticate, sendMessage);

/**
 * @route   GET /api/chatbot/conversations
 * @desc    Get all user conversations
 * @access  Private
 * @query   { limit?: Number }
 */
router.get('/conversations', authenticate, getConversations);

/**
 * @route   POST /api/chatbot/conversation
 * @desc    Create new conversation session
 * @access  Private
 */
router.post('/conversation', authenticate, createConversation);

/**
 * @route   GET /api/chatbot/conversation/:sessionId
 * @desc    Get specific conversation history
 * @access  Private
 */
router.get('/conversation/:sessionId', authenticate, getConversation);

/**
 * @route   DELETE /api/chatbot/conversation/:sessionId
 * @desc    Delete conversation
 * @access  Private
 */
router.delete('/conversation/:sessionId', authenticate, removeConversation);

export default router;
