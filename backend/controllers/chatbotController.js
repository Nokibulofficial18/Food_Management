import {
  generateChatResponse,
  getOrCreateConversation,
  saveMessage,
  updateConversationContext,
  getUserConversations,
  deleteConversation
} from '../services/chatbotService.js';

/**
 * @desc    Send message to NourishBot and get response
 * @route   POST /api/chatbot/message
 * @access  Private
 */
export const sendMessage = async (req, res) => {
  try {
    const { userMessage, sessionId = 'default' } = req.body;
    const userId = req.user.id;

    if (!userMessage || userMessage.trim().length === 0) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    // 1. Get or create conversation
    const conversation = await getOrCreateConversation(userId, sessionId);

    // 2. Save user message
    await saveMessage(conversation._id, 'user', userMessage);

    // 3. Get conversation history
    const conversationHistory = conversation.messages || [];

    // 4. Generate bot response with RAG
    const { botReply, topics, retrievedResources, error } = await generateChatResponse(
      userMessage,
      conversationHistory,
      userId
    );

    // 5. Save bot response
    await saveMessage(conversation._id, 'assistant', botReply, {
      topics,
      retrievedResources,
      llmError: error
    });

    // 6. Update conversation context
    await updateConversationContext(conversation._id, topics, retrievedResources);

    // 7. Return response
    res.json({
      botReply,
      sessionId: conversation.sessionId,
      conversationId: conversation._id,
      topics,
      retrievedResources: retrievedResources.map(r => ({
        title: r.title,
        relevance: r.relevance
      })),
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Chatbot message error:', error);
    res.status(500).json({ 
      message: 'Failed to process message', 
      error: error.message 
    });
  }
};

/**
 * @desc    Get conversation history
 * @route   GET /api/chatbot/conversation/:sessionId
 * @access  Private
 */
export const getConversation = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const conversation = await getOrCreateConversation(userId, sessionId);

    res.json({
      sessionId: conversation.sessionId,
      title: conversation.title,
      messages: conversation.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        topics: msg.metadata?.topics || []
      })),
      context: {
        topics: conversation.context.topics,
        lastTopic: conversation.context.lastTopic
      },
      lastMessageAt: conversation.lastMessageAt
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ 
      message: 'Failed to get conversation', 
      error: error.message 
    });
  }
};

/**
 * @desc    Get all user conversations
 * @route   GET /api/chatbot/conversations
 * @access  Private
 */
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const conversations = await getUserConversations(userId, limit);

    res.json({
      conversations,
      total: conversations.length
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ 
      message: 'Failed to get conversations', 
      error: error.message 
    });
  }
};

/**
 * @desc    Create new conversation session
 * @route   POST /api/chatbot/conversation
 * @access  Private
 */
export const createConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const conversation = await getOrCreateConversation(userId, sessionId);

    res.json({
      sessionId: conversation.sessionId,
      conversationId: conversation._id,
      title: conversation.title,
      createdAt: conversation.createdAt
    });

  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ 
      message: 'Failed to create conversation', 
      error: error.message 
    });
  }
};

/**
 * @desc    Delete conversation
 * @route   DELETE /api/chatbot/conversation/:sessionId
 * @access  Private
 */
export const removeConversation = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const deleted = await deleteConversation(userId, sessionId);

    if (!deleted) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json({ 
      message: 'Conversation deleted successfully',
      sessionId 
    });

  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ 
      message: 'Failed to delete conversation', 
      error: error.message 
    });
  }
};

/**
 * @desc    Get chatbot info and capabilities
 * @route   GET /api/chatbot/info
 * @access  Public
 */
export const getChatbotInfo = async (req, res) => {
  try {
    const llmProvider = process.env.LLM_PROVIDER || 'fallback';
    const isLLMConfigured = !!(process.env.OPENAI_API_KEY || process.env.HUGGINGFACE_API_KEY);

    res.json({
      name: 'NourishBot',
      version: '1.0.0',
      capabilities: [
        'Food Waste Reduction Guidance',
        'Nutrition Balancing Tips',
        'Budget Meal Planning',
        'Creative Leftover Ideas',
        'Local Food Sharing Guidance',
        'Environmental Impact Explanations'
      ],
      features: [
        'Conversation Context Memory',
        'RAG-Enhanced Responses (Mini Knowledge Base)',
        'Topic Detection',
        'Multi-turn Conversations',
        'Personalized Recommendations'
      ],
      llmProvider: isLLMConfigured ? llmProvider : 'fallback (rule-based)',
      status: 'active',
      ragEnabled: true,
      contextWindowMessages: 6,
      supportedTopics: [
        'waste_reduction',
        'nutrition',
        'budget',
        'meal_planning',
        'storage',
        'shopping',
        'environment',
        'sharing'
      ]
    });

  } catch (error) {
    console.error('Get chatbot info error:', error);
    res.status(500).json({ 
      message: 'Failed to get chatbot info', 
      error: error.message 
    });
  }
};

export default {
  sendMessage,
  getConversation,
  getConversations,
  createConversation,
  removeConversation,
  getChatbotInfo
};
