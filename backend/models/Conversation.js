import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'New Conversation'
  },
  messages: [messageSchema],
  context: {
    userPreferences: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
    topics: [{
      type: String
    }],
    lastTopic: String,
    retrievedResources: [{
      resourceId: mongoose.Schema.Types.ObjectId,
      title: String,
      relevance: Number,
      retrievedAt: Date
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
conversationSchema.index({ userId: 1, isActive: 1, lastMessageAt: -1 });
conversationSchema.index({ sessionId: 1 });

// Auto-update lastMessageAt when new messages are added
conversationSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.lastMessageAt = new Date();
  }
  next();
});

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
