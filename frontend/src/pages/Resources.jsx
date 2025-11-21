import { useState, useEffect, useMemo } from 'react';
import { resourceAPI } from '../api';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ category: '', type: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [flippedCard, setFlippedCard] = useState(null);
  const [activeKeywords, setActiveKeywords] = useState([]);

  useEffect(() => {
    loadResources();
  }, [filter]);

  const loadResources = async () => {
    try {
      const params = {};
      if (filter.category) params.category = filter.category;
      if (filter.type) params.type = filter.type;
      
      const response = await resourceAPI.getResources(params);
      setResources(response.data.resources);
    } catch (error) {
      console.error('Failed to load resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(resource => {
    // Text search
    const matchesSearch = searchQuery === '' ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.relatedCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Keyword filter
    const matchesKeywords = activeKeywords.length === 0 ||
      activeKeywords.some(keyword => 
        resource.title.toLowerCase().includes(keyword.toLowerCase()) ||
        resource.description.toLowerCase().includes(keyword.toLowerCase()) ||
        resource.type.toLowerCase() === keyword.toLowerCase() ||
        resource.relatedCategory.toLowerCase() === keyword.toLowerCase()
      );

    return matchesSearch && matchesKeywords;
  });

  // Extract keywords from search and resources
  const suggestedKeywords = useMemo(() => {
    if (!searchQuery) return [];
    
    const allKeywords = new Set();
    
    // Common keywords
    const commonKeywords = ['recipe', 'guide', 'tip', 'storage', 'preservation', 'waste', 'organization'];
    commonKeywords.forEach(kw => {
      if (kw.includes(searchQuery.toLowerCase())) {
        allKeywords.add(kw);
      }
    });

    // Resource types
    const types = ['article', 'video', 'guide', 'tip', 'recipe'];
    types.forEach(type => {
      if (type.includes(searchQuery.toLowerCase())) {
        allKeywords.add(type);
      }
    });

    // Categories
    const categories = ['fruit', 'vegetable', 'dairy', 'grain', 'protein', 'beverage', 'general'];
    categories.forEach(cat => {
      if (cat.includes(searchQuery.toLowerCase())) {
        allKeywords.add(cat);
      }
    });

    return Array.from(allKeywords).slice(0, 8);
  }, [searchQuery]);

  const toggleKeyword = (keyword) => {
    setActiveKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  const getKeywordColor = (keyword) => {
    const colors = {
      recipe: 'bg-pink-100 text-pink-700 border-pink-300',
      guide: 'bg-blue-100 text-blue-700 border-blue-300',
      tip: 'bg-green-100 text-green-700 border-green-300',
      article: 'bg-purple-100 text-purple-700 border-purple-300',
      video: 'bg-red-100 text-red-700 border-red-300',
      storage: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      preservation: 'bg-indigo-100 text-indigo-700 border-indigo-300',
      waste: 'bg-orange-100 text-orange-700 border-orange-300',
      organization: 'bg-teal-100 text-teal-700 border-teal-300',
    };
    return colors[keyword.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getResourceIcon = (type) => {
    const icons = {
      article: '📄',
      video: '🎥',
      guide: '📘',
      tip: '💡',
      recipe: '🍳',
    };
    return icons[type] || '📚';
  };

  const getKeyTakeaways = (resource) => {
    // Generate key takeaways based on resource type
    const takeaways = {
      guide: [
        'Step-by-step instructions',
        'Best practices included',
        'Easy to follow',
      ],
      tip: [
        'Quick implementation',
        'Practical advice',
        'Immediate results',
      ],
      recipe: [
        'Simple ingredients',
        'Detailed directions',
        'Cooking tips included',
      ],
      article: [
        'In-depth information',
        'Expert insights',
        'Research-backed',
      ],
      video: [
        'Visual demonstration',
        'Easy to understand',
        'Follow along format',
      ],
    };
    return takeaways[resource.type] || [
      'Valuable information',
      'Practical tips',
      'Easy to implement',
    ];
  };

  if (loading) {
    return <div className="text-center py-8">Loading resources...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sustainability Resources</h1>
        <p className="text-gray-600 mt-2">Discover guides, tips, and recipes to reduce food waste</p>
      </div>

      {/* Smart Search Bar */}
      <div className="glass-card-strong mb-6 bg-gradient-to-br from-white/60 to-primary-100/40">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">🔍</span>
          <h2 className="text-lg font-bold text-gray-900">Smart Search</h2>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Type to search and discover keyword tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 text-lg"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-primary-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveKeywords([]);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Keyword Tags */}
        {(suggestedKeywords.length > 0 || activeKeywords.length > 0) && (
          <div className="mt-4 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-700">🏷️ Keywords:</span>
              {activeKeywords.length > 0 && (
                <button
                  onClick={() => setActiveKeywords([])}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Active Keywords */}
              {activeKeywords.map(keyword => (
                <button
                  key={keyword}
                  onClick={() => toggleKeyword(keyword)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all transform hover:scale-105 ${getKeywordColor(keyword)} shadow-md`}
                >
                  #{keyword}
                  <span className="ml-2">✕</span>
                </button>
              ))}
              
              {/* Suggested Keywords */}
              {suggestedKeywords
                .filter(kw => !activeKeywords.includes(kw))
                .map(keyword => (
                  <button
                    key={keyword}
                    onClick={() => toggleKeyword(keyword)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all transform hover:scale-105 hover:shadow-md ${getKeywordColor(keyword)} opacity-70 hover:opacity-100`}
                  >
                    #{keyword}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {(filter.category || filter.type || activeKeywords.length > 0) && (
        <div className="mb-6 p-4 glass-card bg-blue-100/30 border-2 border-blue-300/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-blue-900">Active Filters:</span>
              {filter.category && (
                <span className="px-3 py-1 bg-blue-200 text-blue-800 text-xs rounded-full font-medium">
                  Category: {filter.category}
                </span>
              )}
              {filter.type && (
                <span className="px-3 py-1 bg-blue-200 text-blue-800 text-xs rounded-full font-medium">
                  Type: {filter.type}
                </span>
              )}
              {activeKeywords.map(kw => (
                <span key={kw} className="px-3 py-1 bg-blue-200 text-blue-800 text-xs rounded-full font-medium">
                  #{kw}
                </span>
              ))}
            </div>
            <button
              onClick={() => {
                setFilter({ category: '', type: '' });
                setActiveKeywords([]);
                setSearchQuery('');
              }}
              className="text-sm text-blue-700 hover:text-blue-900 font-semibold"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Filter Dropdowns */}
      <div className="glass-card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Category
            </label>
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              className="input-field"
            >
              <option value="">All Categories</option>
              <option value="fruit">🍎 Fruit</option>
              <option value="vegetable">🥕 Vegetable</option>
              <option value="dairy">🥛 Dairy</option>
              <option value="grain">🌾 Grain</option>
              <option value="protein">🍗 Protein</option>
              <option value="beverage">🥤 Beverage</option>
              <option value="snack">🍿 Snack</option>
              <option value="general">📚 General</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Type
            </label>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="input-field"
            >
              <option value="">All Types</option>
              <option value="article">📄 Article</option>
              <option value="video">🎥 Video</option>
              <option value="guide">📘 Guide</option>
              <option value="tip">💡 Tip</option>
              <option value="recipe">🍳 Recipe</option>
            </select>
          </div>
        </div>
      </div>

      {/* Flip Card Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource, index) => (
          <div 
            key={resource._id} 
            className="flip-card-container h-80"
            style={{
              animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
            }}
            onMouseEnter={() => setFlippedCard(resource._id)}
            onMouseLeave={() => setFlippedCard(null)}
          >
            <div className={`flip-card ${flippedCard === resource._id ? 'flipped' : ''}`}>
              {/* Front of Card */}
              <div className="flip-card-front">
                <div className="glass-card-strong h-full flex flex-col bg-gradient-to-br from-white/70 to-gray-50/50 border-2 border-gray-300/40 hover:border-primary-400/60 transition-colors relative overflow-hidden">
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary-100 rounded-bl-full opacity-50"></div>
                  
                  {/* Icon */}
                  <div className="text-5xl mb-4">{getResourceIcon(resource.type)}</div>
                  
                  {/* Title */}
                  <h3 className="font-bold text-gray-900 text-xl mb-3 line-clamp-2">
                    {resource.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-3">
                    {resource.description}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                      resource.type === 'guide' ? 'bg-blue-100 text-blue-700' :
                      resource.type === 'recipe' ? 'bg-pink-100 text-pink-700' :
                      resource.type === 'video' ? 'bg-red-100 text-red-700' :
                      resource.type === 'tip' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {resource.type}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium capitalize">
                      {resource.relatedCategory}
                    </span>
                  </div>

                  {/* Hover Indicator */}
                  <div className="text-center py-2 bg-primary-50 -mx-6 -mb-6 mt-auto">
                    <p className="text-xs text-primary-700 font-semibold">
                      Hover to see key takeaways →
                    </p>
                  </div>
                </div>
              </div>

              {/* Back of Card */}
              <div className="flip-card-back">
                <div className="card h-full flex flex-col bg-gradient-to-br from-primary-500 to-primary-700 text-white border-2 border-primary-600">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-3xl">{getResourceIcon(resource.type)}</span>
                    <h3 className="font-bold text-xl line-clamp-2">{resource.title}</h3>
                  </div>

                  {/* Key Takeaways */}
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                      ✨ Key Takeaways
                    </h4>
                    <ul className="space-y-2">
                      {getKeyTakeaways(resource).map((takeaway, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-yellow-300 mt-1">✓</span>
                          <span className="text-sm">{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Category Badge */}
                  <div className="mb-4">
                    <span className="px-3 py-1 bg-white bg-opacity-20 text-white text-xs rounded-full font-medium capitalize">
                      📚 {resource.relatedCategory}
                    </span>
                  </div>

                  {/* Quick Read Button */}
                  {resource.url && (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-white text-primary-700 font-bold py-3 px-4 rounded-lg hover:bg-yellow-100 transition-colors text-center shadow-lg transform hover:scale-105 duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      📖 Quick Read
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredResources.length === 0 && (
        <div className="glass-card text-center py-16 bg-gradient-to-br from-gray-100/40 to-white/60">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || activeKeywords.length > 0
              ? `Try adjusting your search terms or keywords` 
              : 'Try selecting different filters'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilter({ category: '', type: '' });
              setActiveKeywords([]);
            }}
            className="btn-primary"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Results Count */}
      {filteredResources.length > 0 && (
        <div className="mt-6 text-center text-gray-600">
          Showing <span className="font-bold text-gray-900">{filteredResources.length}</span> of <span className="font-bold text-gray-900">{resources.length}</span> resources
        </div>
      )}
    </div>
  );
};

export default Resources;
