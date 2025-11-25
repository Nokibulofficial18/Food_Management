# NourishBot - LLM-Backed AI Chatbot

## Overview
NourishBot is an intelligent AI assistant specializing in food waste reduction, nutrition balancing, budget meal planning, and sustainable food practices. It features conversation context memory, RAG-enhanced responses, and support for multiple LLM providers.

## 🎯 Capabilities

### 1. **Food Waste Reduction Guidance** 🌱
- Smart storage tips and techniques
- Creative ways to use leftovers
- Consumption pattern analysis
- Waste prevention strategies

### 2. **Nutrition Balancing Tips** 🥗
- Evidence-based nutrition advice
- Meal balancing strategies
- Healthy eating recommendations
- Dietary preference support

### 3. **Budget Meal Planning** 💰
- Cost-effective meal suggestions
- Budget-friendly shopping tips
- Money-saving strategies
- Price comparison guidance

### 4. **Creative Leftover Ideas** ♻️
- Transform leftovers into new meals
- Practical, easy-to-follow recipes
- Ingredient versatility tips
- Batch cooking suggestions

### 5. **Local Food Sharing Guidance** 🤝
- Community sharing programs
- Food donation resources
- Neighborhood food networks
- Sharing best practices

### 6. **Environmental Impact Explanations** 🌍
- Carbon footprint education
- Sustainability practices
- Environmental benefits of waste reduction
- Eco-friendly food choices

## 🏗️ Architecture

### Backend Components

#### 1. **Conversation Model** (`models/Conversation.js`)
Stores chat history and context:
```javascript
{
  userId: ObjectId,
  sessionId: String,
  title: String,
  messages: [{
    role: 'user' | 'assistant' | 'system',
    content: String,
    timestamp: Date,
    metadata: {
      topics: [String],
      retrievedResources: [Object]
    }
  }],
  context: {
    userPreferences: Map,
    topics: [String],
    lastTopic: String,
    retrievedResources: [Object]
  },
  isActive: Boolean,
  lastMessageAt: Date
}
```

#### 2. **RAG Service** (`services/ragService.js`)
Mini Retrieval-Augmented Generation system:

**Features:**
- Semantic similarity search (Jaccard similarity)
- Keyword extraction with stopword filtering
- Topic detection (8 categories)
- Resource relevance scoring
- Context building for LLM prompts

**Topic Categories:**
- `waste_reduction`
- `nutrition`
- `budget`
- `meal_planning`
- `storage`
- `shopping`
- `environment`
- `sharing`

**Functions:**
- `retrieveRelevantResources(message, limit)` - Find top N relevant resources
- `buildContextFromResources(resources)` - Create context prompt
- `detectTopic(message)` - Identify conversation topics
- `getTopicGuidance(topics)` - Get topic-specific instructions

#### 3. **Chatbot Service** (`services/chatbotService.js`)
Main chatbot logic with LLM integration:

**LLM Providers:**
1. **OpenAI** (GPT-3.5-turbo / GPT-4)
   - High-quality responses
   - Fast inference
   - Requires API key

2. **HuggingFace** (Mixtral-8x7B-Instruct)
   - Open-source models
   - Cost-effective
   - Requires API key

3. **Fallback** (Rule-based system)
   - No API key needed
   - Works offline
   - Good quality responses
   - Topic-specific templates

**Functions:**
- `generateChatResponse(message, history, userId)` - Generate bot reply
- `getOrCreateConversation(userId, sessionId)` - Manage sessions
- `saveMessage(conversationId, role, content)` - Store messages
- `updateConversationContext(id, topics, resources)` - Update context
- `getUserConversations(userId, limit)` - Get conversation list
- `deleteConversation(userId, sessionId)` - Remove conversation

**System Prompt:**
NourishBot has a warm, encouraging personality with:
- Practical, action-oriented advice
- Specific examples and tips
- Cultural sensitivity
- Positive reinforcement
- Concise responses (under 250 words)

#### 4. **Chatbot Controller** (`controllers/chatbotController.js`)
API endpoint handlers:

- `POST /api/chatbot/message` - Send message and get response
- `GET /api/chatbot/conversation/:sessionId` - Get conversation history
- `GET /api/chatbot/conversations` - List all conversations
- `POST /api/chatbot/conversation` - Create new session
- `DELETE /api/chatbot/conversation/:sessionId` - Delete conversation
- `GET /api/chatbot/info` - Get bot capabilities

### Frontend Components

#### NourishBot Page (`pages/NourishBot.jsx`)

**Features:**
- 💬 Real-time chat interface
- 📱 Responsive design (mobile + desktop)
- 💾 Conversation history sidebar
- ⚡ Quick prompt suggestions
- 🎯 Topic detection display
- 📚 Retrieved resources indicator
- ⏳ Typing indicators
- 🔄 Auto-scroll to latest message

**UI Sections:**
1. **Sidebar** (Conversation History)
   - New conversation button
   - Recent conversations list
   - Delete conversation option
   - Bot info display
   - Active session indicator

2. **Chat Area**
   - Welcome screen with capabilities
   - Message thread
   - User/bot message bubbles
   - Timestamp display
   - Topic badges
   - Retrieved resources list

3. **Input Area**
   - Message input field
   - Send button
   - Quick prompt buttons
   - Loading state

## 📡 API Endpoints

### POST /api/chatbot/message
Send message to NourishBot.

**Request:**
```json
{
  "userMessage": "How can I reduce food waste?",
  "sessionId": "session_12345" // optional, defaults to 'default'
}
```

**Response:**
```json
{
  "botReply": "Great question about reducing food waste! Here are some strategies...",
  "sessionId": "session_12345",
  "conversationId": "conv_id_123",
  "topics": ["waste_reduction", "storage"],
  "retrievedResources": [
    {
      "title": "Food Storage Best Practices",
      "relevance": 0.85
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### GET /api/chatbot/conversation/:sessionId
Get conversation history.

**Response:**
```json
{
  "sessionId": "session_12345",
  "title": "Food Waste Reduction",
  "messages": [
    {
      "role": "user",
      "content": "How can I reduce food waste?",
      "timestamp": "2024-01-15T10:30:00Z",
      "topics": ["waste_reduction"]
    },
    {
      "role": "assistant",
      "content": "Great question...",
      "timestamp": "2024-01-15T10:30:05Z",
      "topics": ["waste_reduction", "storage"]
    }
  ],
  "context": {
    "topics": ["waste_reduction", "storage"],
    "lastTopic": "storage"
  },
  "lastMessageAt": "2024-01-15T10:30:05Z"
}
```

### GET /api/chatbot/conversations
List all user conversations.

**Query Parameters:**
- `limit` (optional): Number of conversations to return (default: 10)

**Response:**
```json
{
  "conversations": [
    {
      "sessionId": "session_12345",
      "title": "Food Waste Reduction",
      "lastMessageAt": "2024-01-15T10:30:00Z",
      "messageCount": 6,
      "preview": "Great question about reducing food waste..."
    }
  ],
  "total": 1
}
```

### POST /api/chatbot/conversation
Create new conversation session.

**Response:**
```json
{
  "sessionId": "session_98765",
  "conversationId": "conv_id_456",
  "title": "New Conversation",
  "createdAt": "2024-01-15T11:00:00Z"
}
```

### DELETE /api/chatbot/conversation/:sessionId
Delete conversation.

**Response:**
```json
{
  "message": "Conversation deleted successfully",
  "sessionId": "session_12345"
}
```

### GET /api/chatbot/info
Get chatbot capabilities and status.

**Response:**
```json
{
  "name": "NourishBot",
  "version": "1.0.0",
  "capabilities": [
    "Food Waste Reduction Guidance",
    "Nutrition Balancing Tips",
    "Budget Meal Planning",
    "Creative Leftover Ideas",
    "Local Food Sharing Guidance",
    "Environmental Impact Explanations"
  ],
  "features": [
    "Conversation Context Memory",
    "RAG-Enhanced Responses",
    "Topic Detection",
    "Multi-turn Conversations",
    "Personalized Recommendations"
  ],
  "llmProvider": "fallback (rule-based)",
  "status": "active",
  "ragEnabled": true,
  "contextWindowMessages": 6,
  "supportedTopics": [
    "waste_reduction", "nutrition", "budget", "meal_planning",
    "storage", "shopping", "environment", "sharing"
  ]
}
```

## ⚙️ Configuration

### Environment Variables

Add to `.env` file:

```env
# LLM Configuration for NourishBot
LLM_PROVIDER=fallback  # Options: 'openai', 'huggingface', 'fallback'

# OpenAI (optional)
OPENAI_API_KEY=sk-...  # Get at: https://platform.openai.com/api-keys

# HuggingFace (optional)
HUGGINGFACE_API_KEY=hf_...  # Get at: https://huggingface.co/settings/tokens
```

### Provider Setup

#### Option 1: OpenAI (Recommended for quality)
1. Create account at https://platform.openai.com
2. Generate API key
3. Set environment variables:
   ```env
   LLM_PROVIDER=openai
   OPENAI_API_KEY=sk-your-key-here
   ```

**Pros:**
- High-quality responses
- Fast inference
- Good context understanding

**Cons:**
- Costs money (pay-per-use)
- Requires internet connection

#### Option 2: HuggingFace (Open-source alternative)
1. Create account at https://huggingface.co
2. Generate access token
3. Set environment variables:
   ```env
   LLM_PROVIDER=huggingface
   HUGGINGFACE_API_KEY=hf_your-token-here
   ```

**Pros:**
- Free tier available
- Open-source models
- Good quality

**Cons:**
- Slower inference
- May require model warm-up

#### Option 3: Fallback (No API key needed)
Default rule-based system.

```env
LLM_PROVIDER=fallback
```

**Pros:**
- No API key required
- Works offline
- No costs
- Fast responses
- Good quality for common questions

**Cons:**
- Less flexible than LLM
- Limited to predefined topics

## 🚀 Usage Examples

### Frontend Usage

```javascript
import { chatbotAPI } from '../api';

// Send message
const response = await chatbotAPI.sendMessage({
  userMessage: 'How can I use leftover rice?',
  sessionId: 'session_123'
});

console.log(response.data.botReply);
// Output: "Leftover rice is versatile! Try making fried rice..."

// Get conversation history
const conversation = await chatbotAPI.getConversation('session_123');
console.log(conversation.data.messages);

// Create new conversation
const newSession = await chatbotAPI.createConversation();
console.log(newSession.data.sessionId);
```

### Backend Usage

```javascript
import { generateChatResponse } from './services/chatbotService.js';

// Generate response
const result = await generateChatResponse(
  'How can I reduce food waste?',
  conversationHistory,
  userId
);

console.log(result.botReply);
console.log(result.topics); // ['waste_reduction', 'storage']
console.log(result.retrievedResources); // Relevant resources
```

## 🎨 User Interface

### Chat Interface Features

1. **Message Display**
   - User messages: Green bubbles on right
   - Bot messages: White bubbles on left
   - Timestamps for each message
   - Topic badges below bot responses
   - Retrieved resources indicator

2. **Quick Prompts**
   - 💡 How can I reduce food waste?
   - 🥗 Help me balance my nutrition
   - 💰 Suggest budget-friendly meals
   - ♻️ What can I do with leftovers?
   - 🌍 Environmental impact of food waste
   - 🤝 How to share excess food?

3. **Conversation Management**
   - Create new conversation
   - Switch between conversations
   - Delete old conversations
   - Auto-save conversation state

4. **Responsive Design**
   - Desktop: Side-by-side layout
   - Mobile: Collapsible sidebar
   - Touch-friendly buttons
   - Optimized for all screen sizes

## 🧪 RAG System Details

### How RAG Works

1. **User sends message:** "How do I store vegetables?"

2. **Keyword extraction:**
   - Remove stopwords
   - Extract meaningful terms: ['store', 'vegetables']

3. **Topic detection:**
   - Analyze message content
   - Detected: ['storage', 'waste_reduction']

4. **Resource retrieval:**
   - Search knowledge base (Resources collection)
   - Score resources by relevance
   - Use Jaccard similarity for text matching
   - Return top 3-5 resources

5. **Context building:**
   ```
   Relevant Knowledge Base:
   [Resource 1: Vegetable Storage Guide]
   Store leafy greens in airtight containers...
   
   [Resource 2: Proper Food Storage]
   Different vegetables have different needs...
   ```

6. **LLM prompt creation:**
   - System prompt (bot personality)
   - Resource context
   - Topic guidance
   - Conversation history
   - User message

7. **Response generation:**
   - OpenAI/HuggingFace: LLM generates response
   - Fallback: Rule-based template + context

8. **Save to database:**
   - Store user message
   - Store bot response
   - Update conversation context
   - Track retrieved resources

### Similarity Scoring

Resources are scored based on:
- **Title similarity:** 5x weight
- **Description similarity:** 3x weight
- **Content similarity:** 2x weight
- **Category match:** +3 points
- **Keyword overlap:** 0.5 per keyword
- **Tag matches:** +1 per tag

Minimum relevance threshold: 0.5

## 📊 Context Management

### Conversation Context
Each conversation maintains:
- **Topics discussed:** Array of detected topics
- **Last topic:** Most recent topic
- **User preferences:** Map of user-specific settings
- **Retrieved resources:** History of resources used

### Context Window
- **Message limit:** Last 6 messages included in context
- **Why 6?** Balance between context and token limits
- Older messages still stored but not sent to LLM

### Context Chaining
Messages flow:
```
Message 1: "How to reduce waste?"
↓
Bot learns: User interested in waste_reduction
↓
Message 2: "What about vegetables?"
↓
Bot uses context: Combine waste + vegetable storage
↓
Message 3: "How long do they last?"
↓
Bot knows: Referring to vegetables from Message 2
```

## 🎯 Best Practices

### For Users
1. **Be specific:** "How to store tomatoes?" vs "Storage tips?"
2. **Ask follow-ups:** Bot maintains context
3. **Use natural language:** No need for keywords
4. **Try quick prompts:** Great conversation starters

### For Developers
1. **Monitor API costs:** If using OpenAI/HuggingFace
2. **Implement rate limiting:** Prevent abuse
3. **Cache common queries:** Reduce API calls
4. **Log conversations:** Debug and improve
5. **Update resources:** Keep knowledge base current

## 🔧 Customization

### Adding New Topics

1. **Update topic keywords** in `ragService.js`:
```javascript
const topicKeywords = {
  'new_topic': ['keyword1', 'keyword2', 'keyword3'],
  // ... existing topics
};
```

2. **Add topic guidance** in `ragService.js`:
```javascript
const guidance = {
  new_topic: 'Specific guidance for this topic...',
  // ... existing guidance
};
```

3. **Update system prompt** in `chatbotService.js` if needed

### Adding Custom Prompts

Edit quick prompts in `NourishBot.jsx`:
```javascript
const quickPrompts = [
  '🆕 Your new prompt here',
  // ... existing prompts
];
```

### Customizing Personality

Edit `SYSTEM_PROMPT` in `chatbotService.js`:
```javascript
const SYSTEM_PROMPT = `You are NourishBot...
[Modify personality traits here]
`;
```

## 🐛 Troubleshooting

### Common Issues

**1. Bot not responding:**
- Check MongoDB connection
- Verify LLM_PROVIDER in .env
- Check API keys if using OpenAI/HuggingFace
- Check browser console for errors

**2. Low-quality responses:**
- Use OpenAI provider for better quality
- Add more resources to knowledge base
- Improve resource descriptions

**3. Slow responses:**
- Switch to OpenAI (faster than HuggingFace)
- Use fallback for instant responses
- Check internet connection

**4. Context not maintained:**
- Verify conversation is being saved
- Check sessionId consistency
- Clear old conversations

## 📈 Future Enhancements

1. **Advanced RAG:**
   - Vector embeddings (sentence-transformers)
   - Semantic search
   - Better relevance scoring

2. **User Personalization:**
   - Learn from user preferences
   - Adapt tone based on feedback
   - Remember dietary restrictions

3. **Multi-modal Support:**
   - Image analysis (food photos)
   - Voice input/output
   - Recipe image recognition

4. **Integration:**
   - Connect to inventory data
   - Suggest recipes from available items
   - Sync with meal planner

5. **Analytics:**
   - Track popular topics
   - Measure user satisfaction
   - A/B test prompts

## 📝 Files Created/Modified

### Backend
- ✅ `backend/models/Conversation.js` (NEW) - Conversation storage model
- ✅ `backend/services/ragService.js` (NEW) - RAG retrieval system
- ✅ `backend/services/chatbotService.js` (NEW) - LLM integration & logic
- ✅ `backend/controllers/chatbotController.js` (NEW) - API handlers
- ✅ `backend/routes/chatbotRoutes.js` (NEW) - Route definitions
- ✅ `backend/server.js` (MODIFIED) - Register chatbot routes
- ✅ `backend/.env.example` (MODIFIED) - Add LLM configuration

### Frontend
- ✅ `frontend/src/pages/NourishBot.jsx` (NEW) - Chat UI
- ✅ `frontend/src/api/index.js` (MODIFIED) - Add chatbot API
- ✅ `frontend/src/App.jsx` (MODIFIED) - Add route
- ✅ `frontend/src/components/Navbar.jsx` (MODIFIED) - Add menu item

## 🎓 Learning Resources

### LLM Integration
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [HuggingFace Inference API](https://huggingface.co/docs/api-inference)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)

### RAG Systems
- [RAG Introduction](https://python.langchain.com/docs/use_cases/question_answering/)
- [Vector Databases](https://www.pinecone.io/learn/vector-database/)
- [Semantic Search](https://www.sbert.net/)

### Chatbot Design
- [Conversational UX](https://www.nngroup.com/articles/chatbot-design/)
- [Chat UI Patterns](https://www.chatbot.com/blog/chatbot-ui/)

---

**Status:** ✅ Complete and Production-Ready

**Last Updated:** November 2024

**Version:** 1.0.0
