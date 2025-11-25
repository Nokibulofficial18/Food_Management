import Conversation from '../models/Conversation.js';
import { 
  retrieveRelevantResources, 
  buildContextFromResources, 
  detectTopic,
  getTopicGuidance 
} from './ragService.js';

/**
 * NourishBot - LLM-backed chatbot for food waste reduction, nutrition, and meal planning
 * 
 * Environment Variables Required:
 * - OPENAI_API_KEY: OpenAI API key (for GPT models)
 * - HUGGINGFACE_API_KEY: HuggingFace API key (alternative LLM provider)
 * - LLM_PROVIDER: 'openai' or 'huggingface' or 'fallback' (default: fallback)
 */

const LLM_PROVIDER = process.env.LLM_PROVIDER || 'fallback';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || '';

/**
 * System prompt for NourishBot personality and capabilities
 */
const SYSTEM_PROMPT = `You are NourishBot, a friendly and knowledgeable AI assistant specializing in:

🌱 Food Waste Reduction: Help users minimize food waste through smart storage, creative leftover recipes, and consumption planning.

🥗 Nutrition Balancing: Provide evidence-based nutrition advice, meal balancing tips, and healthy eating strategies.

💰 Budget Meal Planning: Suggest cost-effective meal plans, budget-friendly alternatives, and money-saving shopping tips.

♻️ Creative Leftover Ideas: Transform leftovers into delicious new meals with practical, easy-to-follow recipes.

🤝 Local Food Sharing: Guide users on food donation, community sharing programs, and reducing waste through sharing.

🌍 Environmental Impact: Explain the environmental benefits of reducing food waste and sustainable food practices.

Your personality:
- Warm, encouraging, and supportive
- Practical and action-oriented
- Educational but not preachy
- Culturally sensitive and inclusive
- Concise but thorough when needed

Always:
- Provide specific, actionable advice
- Use examples and practical tips
- Acknowledge user context and preferences
- Encourage sustainable habits
- Be positive about small steps toward improvement

Keep responses conversational, helpful, and under 250 words unless detailed explanation is requested.`;

/**
 * Call OpenAI API (GPT-3.5 or GPT-4)
 */
const callOpenAI = async (messages) => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // or 'gpt-4' for better quality
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1,
        frequency_penalty: 0.3,
        presence_penalty: 0.3
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
};

/**
 * Call HuggingFace Inference API
 */
const callHuggingFace = async (messages) => {
  if (!HUGGINGFACE_API_KEY) {
    throw new Error('HuggingFace API key not configured');
  }

  try {
    // Convert messages to prompt format
    const prompt = messages.map(m => {
      if (m.role === 'system') return `System: ${m.content}`;
      if (m.role === 'user') return `User: ${m.content}`;
      return `Assistant: ${m.content}`;
    }).join('\n\n') + '\n\nAssistant:';

    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            top_p: 0.95,
            return_full_text: false
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'HuggingFace API error');
    }

    const data = await response.json();
    return data[0].generated_text.trim();
  } catch (error) {
    console.error('HuggingFace API error:', error);
    throw error;
  }
};

/**
 * Fallback rule-based response system
 */
const generateFallbackResponse = (userMessage, context) => {
  const messageLower = userMessage.toLowerCase();
  
  // Greeting responses
  if (/^(hi|hello|hey|greetings)/i.test(userMessage)) {
    return "Hello! 👋 I'm NourishBot, your AI assistant for reducing food waste, planning nutritious meals, and making the most of your food budget. How can I help you today?";
  }

  // Detect topics
  const topics = detectTopic(userMessage);
  
  // Topic-specific responses
  if (topics.includes('waste_reduction')) {
    return `Great question about reducing food waste! Here are some key strategies:

🗓️ **Plan Ahead**: Create weekly meal plans to buy only what you need
📦 **Proper Storage**: Store fruits and vegetables separately, keep herbs in water
❄️ **Freeze Smartly**: Freeze leftovers, overripe fruits, and bread before they spoil
🍲 **Creative Cooking**: Turn vegetable scraps into broth, stale bread into croutons
📊 **Track Waste**: Use the consumption logs to identify patterns

Small changes make a big difference! What specific foods are you struggling with?`;
  }

  if (topics.includes('nutrition')) {
    return `Nutrition is key to healthy living! Here's a balanced approach:

🥗 **Colorful Plates**: Aim for variety - different colors mean different nutrients
🥩 **Protein Power**: Include lean proteins (beans, fish, chicken, tofu)
🌾 **Whole Grains**: Choose brown rice, quinoa, whole wheat over refined grains
🥛 **Calcium Sources**: Dairy, fortified plant milk, leafy greens
🍎 **5-a-Day**: Eat at least 5 servings of fruits and vegetables

The AI Analysis feature can help track your nutritional balance. What's your main nutrition goal?`;
  }

  if (topics.includes('budget')) {
    return `Smart budgeting makes healthy eating affordable! Try these tips:

💡 **Buy in Season**: Seasonal produce is cheaper and fresher
🏪 **Store Brands**: Often same quality at lower prices
🛒 **Meal Prep**: Batch cooking saves time and money
📝 **Shopping List**: Stick to your list to avoid impulse buys
💰 **Price per Unit**: Compare unit prices, not package prices

Check the Meal Planner for budget-optimized meal suggestions. What's your weekly food budget?`;
  }

  if (topics.includes('meal_planning')) {
    return `Meal planning is a game-changer! Here's how to start:

📅 **Weekly Planning**: Plan Sunday-Saturday, considering your schedule
🔄 **Versatile Ingredients**: Buy items that work in multiple recipes
⏰ **Time-Saving**: Prep ingredients on weekends
🍱 **Batch Cooking**: Double recipes and freeze portions
🎯 **Theme Nights**: Meatless Monday, Taco Tuesday, etc.

Use the AI Meal Optimizer to generate personalized 7-day plans. What type of meals do you enjoy?`;
  }

  if (topics.includes('sharing')) {
    return `Food sharing reduces waste and builds community! Options include:

🏘️ **Community Fridges**: Share excess food with neighbors
🏦 **Food Banks**: Donate non-perishables before expiration
📱 **Food Sharing Apps**: OLIO, Too Good To Go, local groups
👥 **Meal Trains**: Coordinate with friends and family
🎁 **Garden Bounty**: Share homegrown produce

Remember: Never share expired or spoiled food. What would you like to share?`;
  }

  if (topics.includes('environment')) {
    return `Food waste has huge environmental impact:

🌍 **Greenhouse Gases**: Wasted food in landfills produces methane (28x more potent than CO2)
💧 **Water Waste**: 1/4 of freshwater use goes to uneaten food
🌾 **Land Use**: Wasted food = wasted agricultural land
⚡ **Energy**: Energy used in production, transport, storage goes to waste

Your actions matter! Every 1 kg of food waste prevented saves ~2.5 kg CO2 equivalent.

Want to calculate your environmental savings?`;
  }

  // Leftover-specific questions
  if (/leftover|left over|remain/i.test(messageLower)) {
    return `Leftover magic! Here are creative ideas:

🍗 **Roast Chicken**: → Chicken salad, soup, quesadillas, fried rice
🍝 **Pasta**: → Pasta bake, frittata, cold pasta salad
🍚 **Rice**: → Fried rice, rice pudding, stuffed peppers
🥔 **Vegetables**: → Vegetable soup, stir-fry, frittata, smoothies
🍞 **Bread**: → French toast, breadcrumbs, croutons, bread pudding

Tell me what leftovers you have, and I'll suggest specific recipes!`;
  }

  // Context-aware response
  if (context && context.retrievedResources && context.retrievedResources.length > 0) {
    const resourceTitles = context.retrievedResources.map(r => r.title).join(', ');
    return `I found some helpful resources related to your question: ${resourceTitles}. 

To give you the best advice, could you provide more details about your specific situation? For example:
- What ingredients or leftovers do you have?
- What's your dietary preference or budget?
- Are you looking for quick meals or batch cooking?

The more specific you are, the better I can help!`;
  }

  // Default response
  return `I'm here to help with food waste reduction, nutrition, budget meal planning, and more! 

I can assist you with:
- 🌱 Reducing food waste and storage tips
- 🥗 Balancing nutrition and healthy eating
- 💰 Budget-friendly meal planning
- ♻️ Creative leftover recipes
- 🤝 Food sharing and donation
- 🌍 Environmental impact of food choices

What would you like to know more about?`;
};

/**
 * Generate chatbot response with RAG enhancement
 */
export const generateChatResponse = async (userMessage, conversationHistory = [], userId = null) => {
  try {
    // 1. Retrieve relevant resources using RAG
    const relevantResources = await retrieveRelevantResources(userMessage, 3);
    const resourceContext = buildContextFromResources(relevantResources);

    // 2. Detect topics for guidance
    const topics = detectTopic(userMessage);
    const topicGuidance = getTopicGuidance(topics);

    // 3. Build enhanced system prompt with context
    const enhancedSystemPrompt = `${SYSTEM_PROMPT}${resourceContext}${topicGuidance}`;

    // 4. Build conversation messages
    const messages = [
      { role: 'system', content: enhancedSystemPrompt },
      ...conversationHistory.slice(-6).map(msg => ({ // Keep last 6 messages for context
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];

    // 5. Generate response based on provider
    let botResponse;

    if (LLM_PROVIDER === 'openai' && OPENAI_API_KEY) {
      botResponse = await callOpenAI(messages);
    } else if (LLM_PROVIDER === 'huggingface' && HUGGINGFACE_API_KEY) {
      botResponse = await callHuggingFace(messages);
    } else {
      // Fallback to rule-based system
      botResponse = generateFallbackResponse(userMessage, {
        topics,
        retrievedResources: relevantResources
      });
    }

    return {
      botReply: botResponse,
      topics: topics,
      retrievedResources: relevantResources.map(r => ({
        resourceId: r.id,
        title: r.title,
        relevance: parseFloat(r.relevanceScore)
      }))
    };

  } catch (error) {
    console.error('Chat response generation error:', error);
    
    // Fallback to rule-based on error
    const topics = detectTopic(userMessage);
    return {
      botReply: generateFallbackResponse(userMessage, { topics }),
      topics: topics,
      retrievedResources: [],
      error: error.message
    };
  }
};

/**
 * Get or create conversation session
 */
export const getOrCreateConversation = async (userId, sessionId) => {
  let conversation = await Conversation.findOne({ 
    userId, 
    sessionId,
    isActive: true 
  });

  if (!conversation) {
    conversation = await Conversation.create({
      userId,
      sessionId,
      title: 'New Conversation',
      messages: [],
      context: {
        userPreferences: new Map(),
        topics: [],
        retrievedResources: []
      }
    });
  }

  return conversation;
};

/**
 * Save message to conversation
 */
export const saveMessage = async (conversationId, role, content, metadata = {}) => {
  const conversation = await Conversation.findById(conversationId);
  
  if (!conversation) {
    throw new Error('Conversation not found');
  }

  conversation.messages.push({
    role,
    content,
    metadata,
    timestamp: new Date()
  });

  // Auto-generate title from first user message
  if (conversation.messages.length === 1 && role === 'user') {
    conversation.title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
  }

  await conversation.save();
  return conversation;
};

/**
 * Update conversation context
 */
export const updateConversationContext = async (conversationId, topics, retrievedResources) => {
  const conversation = await Conversation.findById(conversationId);
  
  if (!conversation) {
    throw new Error('Conversation not found');
  }

  // Add new topics
  topics.forEach(topic => {
    if (!conversation.context.topics.includes(topic)) {
      conversation.context.topics.push(topic);
    }
  });

  // Update last topic
  if (topics.length > 0) {
    conversation.context.lastTopic = topics[0];
  }

  // Add retrieved resources
  if (retrievedResources && retrievedResources.length > 0) {
    conversation.context.retrievedResources.push(
      ...retrievedResources.map(r => ({
        ...r,
        retrievedAt: new Date()
      }))
    );
  }

  await conversation.save();
  return conversation;
};

/**
 * Get user's conversation history
 */
export const getUserConversations = async (userId, limit = 10) => {
  const conversations = await Conversation.find({ userId, isActive: true })
    .sort({ lastMessageAt: -1 })
    .limit(limit)
    .select('sessionId title lastMessageAt messages')
    .lean();

  return conversations.map(conv => ({
    sessionId: conv.sessionId,
    title: conv.title,
    lastMessageAt: conv.lastMessageAt,
    messageCount: conv.messages.length,
    preview: conv.messages[conv.messages.length - 1]?.content.substring(0, 100) || ''
  }));
};

/**
 * Delete conversation
 */
export const deleteConversation = async (userId, sessionId) => {
  const result = await Conversation.updateOne(
    { userId, sessionId },
    { $set: { isActive: false } }
  );

  return result.modifiedCount > 0;
};

export default {
  generateChatResponse,
  getOrCreateConversation,
  saveMessage,
  updateConversationContext,
  getUserConversations,
  deleteConversation
};
