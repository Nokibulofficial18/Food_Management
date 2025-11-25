import Resource from '../models/Resource.js';

/**
 * Mini RAG (Retrieval-Augmented Generation) System
 * Retrieves relevant resources from the knowledge base to enhance chatbot responses
 */

/**
 * Simple text similarity using word overlap (Jaccard similarity)
 * In production, use embeddings (sentence-transformers, OpenAI embeddings)
 */
const calculateSimilarity = (text1, text2) => {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
};

/**
 * Extract keywords from user message for better retrieval
 */
const extractKeywords = (message) => {
  const stopWords = new Set([
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'you', 'your', 'yours',
    'he', 'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them', 'their',
    'what', 'which', 'who', 'when', 'where', 'why', 'how', 'a', 'an', 'the',
    'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at',
    'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
    'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once',
    'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might'
  ]);

  const words = message.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  return [...new Set(words)]; // Remove duplicates
};

/**
 * Detect the topic/category from user message
 */
const detectTopic = (message) => {
  const messageLower = message.toLowerCase();
  
  const topicKeywords = {
    'waste_reduction': ['waste', 'throw', 'discard', 'spoil', 'expire', 'leftover', 'reduce waste'],
    'nutrition': ['nutrition', 'healthy', 'vitamin', 'protein', 'carb', 'fat', 'calorie', 'nutrient', 'diet', 'balanced'],
    'budget': ['budget', 'cheap', 'afford', 'save money', 'cost', 'price', 'expensive', 'frugal'],
    'meal_planning': ['meal', 'plan', 'recipe', 'cook', 'prepare', 'dinner', 'lunch', 'breakfast'],
    'storage': ['store', 'storage', 'preserve', 'freeze', 'refrigerate', 'keep fresh', 'shelf life'],
    'shopping': ['shop', 'buy', 'purchase', 'grocery', 'market', 'store'],
    'environment': ['environment', 'carbon', 'climate', 'sustainable', 'eco', 'green', 'impact'],
    'sharing': ['share', 'donate', 'community', 'neighbor', 'food bank', 'give away']
  };

  const detectedTopics = [];
  
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => messageLower.includes(keyword))) {
      detectedTopics.push(topic);
    }
  }

  return detectedTopics.length > 0 ? detectedTopics : ['general'];
};

/**
 * Retrieve relevant resources from the knowledge base
 */
export const retrieveRelevantResources = async (userMessage, limit = 5) => {
  try {
    const keywords = extractKeywords(userMessage);
    const topics = detectTopic(userMessage);

    // Fetch all resources (in production, use vector search or full-text search)
    const allResources = await Resource.find({ isActive: true }).lean();

    if (!allResources || allResources.length === 0) {
      return [];
    }

    // Score each resource based on relevance
    const scoredResources = allResources.map(resource => {
      let score = 0;

      // Title similarity (high weight)
      const titleSimilarity = calculateSimilarity(userMessage, resource.title);
      score += titleSimilarity * 5;

      // Description similarity (medium weight)
      if (resource.description) {
        const descSimilarity = calculateSimilarity(userMessage, resource.description);
        score += descSimilarity * 3;
      }

      // Content similarity (medium weight)
      if (resource.content) {
        const contentSimilarity = calculateSimilarity(userMessage, resource.content);
        score += contentSimilarity * 2;
      }

      // Category match (high weight)
      if (resource.category && topics.includes(resource.category)) {
        score += 3;
      }

      // Keyword overlap
      const resourceText = `${resource.title} ${resource.description || ''} ${resource.content || ''}`.toLowerCase();
      const keywordMatches = keywords.filter(kw => resourceText.includes(kw)).length;
      score += keywordMatches * 0.5;

      // Tags match
      if (resource.tags && resource.tags.length > 0) {
        const tagMatches = resource.tags.filter(tag => 
          keywords.some(kw => tag.toLowerCase().includes(kw))
        ).length;
        score += tagMatches;
      }

      return {
        ...resource,
        relevanceScore: score
      };
    });

    // Sort by relevance and return top results
    const topResources = scoredResources
      .filter(r => r.relevanceScore > 0.5) // Minimum relevance threshold
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)
      .map(r => ({
        id: r._id,
        title: r.title,
        description: r.description,
        content: r.content,
        category: r.category,
        url: r.url,
        relevanceScore: r.relevanceScore.toFixed(2)
      }));

    return topResources;
  } catch (error) {
    console.error('Resource retrieval error:', error);
    return [];
  }
};

/**
 * Build context prompt from retrieved resources
 */
export const buildContextFromResources = (resources) => {
  if (!resources || resources.length === 0) {
    return '';
  }

  const contextParts = resources.map((res, idx) => {
    return `[Resource ${idx + 1}: ${res.title}]\n${res.description || res.content?.substring(0, 200) || ''}`;
  });

  return `\nRelevant Knowledge Base:\n${contextParts.join('\n\n')}`;
};

/**
 * Get topic-specific guidance prompts
 */
export const getTopicGuidance = (topics) => {
  const guidance = {
    waste_reduction: 'Focus on practical waste reduction strategies, storage tips, and creative ways to use leftovers.',
    nutrition: 'Provide balanced nutrition advice, explain nutrient benefits, and suggest healthy meal combinations.',
    budget: 'Emphasize cost-effective shopping, meal planning for savings, and budget-friendly alternatives.',
    meal_planning: 'Offer practical meal planning advice, batch cooking tips, and recipe suggestions.',
    storage: 'Explain proper food storage techniques, shelf life extension methods, and preservation tips.',
    shopping: 'Provide smart shopping strategies, seasonal buying tips, and how to avoid impulse purchases.',
    environment: 'Discuss environmental impact of food waste, carbon footprint reduction, and sustainable practices.',
    sharing: 'Suggest local food sharing options, donation strategies, and community engagement.'
  };

  const relevantGuidance = topics
    .filter(topic => guidance[topic])
    .map(topic => guidance[topic]);

  return relevantGuidance.length > 0 
    ? `\nGuidance: ${relevantGuidance.join(' ')}`
    : '';
};

export default {
  retrieveRelevantResources,
  buildContextFromResources,
  detectTopic,
  getTopicGuidance
};
