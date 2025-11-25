import { useState, useEffect, useRef } from 'react';
import { chatbotAPI } from '../api';

const NourishBot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('default');
  const [conversations, setConversations] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [botInfo, setBotInfo] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadBotInfo();
    loadConversation();
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadBotInfo = async () => {
    try {
      const response = await chatbotAPI.getInfo();
      setBotInfo(response.data);
    } catch (error) {
      console.error('Failed to load bot info:', error);
    }
  };

  const loadConversation = async (sid = sessionId) => {
    try {
      const response = await chatbotAPI.getConversation(sid);
      setMessages(response.data.messages || []);
      setSessionId(sid);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await chatbotAPI.getConversations();
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message immediately
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const response = await chatbotAPI.sendMessage({
        userMessage,
        sessionId
      });

      // Add bot response
      const botMessage = {
        role: 'assistant',
        content: response.data.botReply,
        timestamp: new Date(response.data.timestamp),
        topics: response.data.topics,
        retrievedResources: response.data.retrievedResources
      };
      setMessages(prev => [...prev, botMessage]);

      // Refresh conversations list
      loadConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Add error message
      const errorMessage = {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = async () => {
    try {
      const response = await chatbotAPI.createConversation();
      setSessionId(response.data.sessionId);
      setMessages([]);
      loadConversations();
      setShowSidebar(false);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleSelectConversation = (sid) => {
    loadConversation(sid);
    setShowSidebar(false);
  };

  const handleDeleteConversation = async (sid) => {
    try {
      await chatbotAPI.deleteConversation(sid);
      loadConversations();
      
      if (sid === sessionId) {
        handleNewConversation();
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const quickPrompts = [
    '💡 How can I reduce food waste?',
    '🥗 Help me balance my nutrition',
    '💰 Suggest budget-friendly meals',
    '♻️ What can I do with leftovers?',
    '🌍 Environmental impact of food waste',
    '🤝 How to share excess food?'
  ];

  return (
    <div className="flex h-[calc(100vh-120px)] bg-gray-50 rounded-lg overflow-hidden border-2 border-gray-200">
      {/* Sidebar - Conversation History */}
      <div className={`${showSidebar ? 'block' : 'hidden'} md:block w-full md:w-80 bg-white border-r-2 border-gray-200 flex flex-col`}>
        <div className="p-4 border-b-2 border-gray-200">
          <button
            onClick={handleNewConversation}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2 font-medium"
          >
            <span>➕</span>
            <span>New Conversation</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">Recent Conversations</h3>
          {conversations.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No conversations yet</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.sessionId}
                className={`p-3 rounded-lg border-2 cursor-pointer transition ${
                  conv.sessionId === sessionId
                    ? 'bg-green-50 border-green-300'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <button
                    onClick={() => handleSelectConversation(conv.sessionId)}
                    className="flex-1 text-left"
                  >
                    <div className="font-medium text-gray-800 text-sm truncate">
                      {conv.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 truncate">
                      {conv.preview}
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(conv.sessionId);
                    }}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    🗑️
                  </button>
                </div>
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  <span>{conv.messageCount} messages</span>
                  <span>{new Date(conv.lastMessageAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bot Info */}
        {botInfo && (
          <div className="p-4 border-t-2 border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-600">
              <div className="font-semibold mb-1">🤖 {botInfo.name}</div>
              <div className="text-gray-500">
                Status: <span className="text-green-600 font-medium">{botInfo.status}</span>
              </div>
              <div className="text-gray-500">
                Provider: {botInfo.llmProvider}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b-2 border-gray-200 p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="md:hidden text-gray-600 hover:text-gray-800"
            >
              ☰
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                <span>🤖</span>
                <span>NourishBot</span>
              </h1>
              <p className="text-sm text-gray-600">Your AI food waste reduction assistant</p>
            </div>
          </div>
          <div className="hidden md:flex space-x-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              💬 Chat Active
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              🧠 RAG Enabled
            </span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to NourishBot!</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                I'm here to help you reduce food waste, plan nutritious meals, manage your budget, 
                and make sustainable food choices. Ask me anything!
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputMessage(prompt.substring(3))}
                    className="p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition text-sm text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {botInfo && (
                <div className="mt-8 max-w-2xl mx-auto">
                  <details className="bg-white border-2 border-gray-200 rounded-lg p-4">
                    <summary className="font-semibold text-gray-800 cursor-pointer">
                      My Capabilities
                    </summary>
                    <div className="mt-3 space-y-2 text-sm text-left">
                      {botInfo.capabilities.map((cap, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <span className="text-green-600">✓</span>
                          <span className="text-gray-700">{cap}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      msg.role === 'user'
                        ? 'bg-green-600 text-white'
                        : msg.isError
                        ? 'bg-red-50 border-2 border-red-200 text-red-800'
                        : 'bg-white border-2 border-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="flex items-start space-x-2 mb-2">
                      <span className="text-xl">
                        {msg.role === 'user' ? '👤' : '🤖'}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-sm mb-1">
                          {msg.role === 'user' ? 'You' : 'NourishBot'}
                        </div>
                      </div>
                      <span className="text-xs opacity-70">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>

                    <div className="whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </div>

                    {msg.topics && msg.topics.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-1">
                        {msg.topics.map((topic, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                          >
                            {topic.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    )}

                    {msg.retrievedResources && msg.retrievedResources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs font-medium mb-2 opacity-70">
                          📚 Retrieved Resources:
                        </div>
                        <div className="space-y-1">
                          {msg.retrievedResources.map((res, i) => (
                            <div key={i} className="text-xs opacity-80">
                              • {res.title} (relevance: {res.relevance})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-4 max-w-[80%]">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">🤖</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">NourishBot is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t-2 border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me about food waste, nutrition, meal planning..."
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </form>

          {messages.length === 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {quickPrompts.slice(0, 3).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputMessage(prompt.substring(3))}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NourishBot;
