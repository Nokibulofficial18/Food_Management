import { useState, useEffect, useRef } from 'react';
import { summaryAPI, uploadAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showStats, setShowStats] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [currentResourceIndex, setCurrentResourceIndex] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    loadSummary();
    // Trigger stats animation after component mounts
    setTimeout(() => setShowStats(true), 100);
  }, []);

  const loadSummary = async () => {
    try {
      const response = await summaryAPI.getSummary();
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to load summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploadLoading(true);
    setUploadSuccess(false);
    const formData = new FormData();
    formData.append('image', uploadFile);

    try {
      await uploadAPI.uploadFile(formData);
      setUploadFile(null);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      alert('Failed to upload file');
    } finally {
      setUploadLoading(false);
    }
  };

  const getFilteredLogs = () => {
    if (!summary?.consumption?.recentLogs) return [];
    if (selectedCategory === 'all') return summary.consumption.recentLogs;
    return summary.consumption.recentLogs.filter(log => log.category === selectedCategory);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      fruit: '🍎',
      vegetable: '🥕',
      dairy: '🥛',
      grain: '🌾',
      protein: '🍖',
      beverage: '🥤',
      snack: '🍪',
      other: '🍽️'
    };
    return icons[category] || '🍽️';
  };

  const getExpiringSoonByCategory = () => {
    if (!summary?.inventory?.byCategory) return [];
    const categories = Object.entries(summary.inventory.byCategory)
      .filter(([_, data]) => data.expiringSoon > 0)
      .map(([category, data]) => ({
        category,
        count: data.expiringSoon,
        icon: getCategoryIcon(category)
      }));
    return categories;
  };

  const scrollCarousel = (direction) => {
    const resources = summary?.recommendedResources?.resources || [];
    if (direction === 'next') {
      setCurrentResourceIndex((prev) => (prev + 1) % resources.length);
    } else {
      setCurrentResourceIndex((prev) => (prev - 1 + resources.length) % resources.length);
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const logDate = new Date(date);
    const diff = now - logDate;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {uploadSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">File uploaded successfully!</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your food sustainability journey</p>
        </div>
        <div className="text-right bg-white px-6 py-3 rounded-lg shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">Welcome back,</p>
          <p className="font-semibold text-gray-900 text-lg">{user?.fullName}</p>
        </div>
      </div>

      {/* Inventory Summary with Animations */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Items Card */}
        <div 
          className={`glass-card-strong bg-gradient-to-br from-blue-500/90 to-blue-600/90 text-white transform transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer border-2 border-blue-400/30 ${showStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          style={{ transitionDelay: '0ms' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90">Total Items</h3>
              <p className="text-4xl font-bold mt-2">{summary?.inventory?.total || 0}</p>
            </div>
            <div className="text-5xl opacity-80">📦</div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-400 border-opacity-30">
            <p className="text-xs opacity-75">In your inventory</p>
          </div>
        </div>

        {/* Expired Card */}
        <div 
          className={`glass-card-strong bg-gradient-to-br from-red-500/90 to-red-600/90 text-white transform transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer border-2 border-red-400/30 ${showStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          style={{ transitionDelay: '100ms' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90">Expired</h3>
              <p className="text-4xl font-bold mt-2">{summary?.inventory?.expired || 0}</p>
            </div>
            <div className="text-5xl opacity-80">⚠️</div>
          </div>
          <div className="mt-4 pt-4 border-t border-red-400 border-opacity-30">
            <p className="text-xs opacity-75">Needs attention</p>
          </div>
        </div>

        {/* Expiring Soon Card with Donut Chart */}
        <div 
          className={`glass-card-strong bg-gradient-to-br from-yellow-400/90 to-red-500/90 text-white transform transition-all duration-700 cursor-pointer border-2 border-yellow-300/30 ${showStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} ${expandedCard === 'expiring' ? 'md:col-span-2 scale-105' : ''}`}
          style={{ transitionDelay: '200ms' }}
          onMouseEnter={() => setExpandedCard('expiring')}
          onMouseLeave={() => setExpandedCard(null)}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-medium opacity-90">Expiring Soon</h3>
              <p className="text-4xl font-bold mt-2">{summary?.inventory?.expiringSoon || 0}</p>
            </div>
            {expandedCard !== 'expiring' && (
              <div className="text-5xl opacity-80">⏰</div>
            )}
          </div>

          {/* Animated Donut Chart */}
          {expandedCard === 'expiring' && getExpiringSoonByCategory().length > 0 && (
            <div className="mt-4 animate-pulse-subtle">
              <div className="flex items-center gap-4">
                {/* SVG Donut Chart */}
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {(() => {
                      const total = getExpiringSoonByCategory().reduce((sum, cat) => sum + cat.count, 0);
                      let currentAngle = 0;
                      const colors = ['#ef4444', '#f59e0b', '#eab308', '#fb923c', '#f97316'];
                      
                      return getExpiringSoonByCategory().map((cat, index) => {
                        const percentage = (cat.count / total) * 100;
                        const angle = (percentage / 100) * 360;
                        const radius = 40;
                        const circumference = 2 * Math.PI * radius;
                        const strokeDasharray = `${(angle / 360) * circumference} ${circumference}`;
                        const rotation = currentAngle;
                        currentAngle += angle;
                        
                        return (
                          <circle
                            key={cat.category}
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="none"
                            stroke={colors[index % colors.length]}
                            strokeWidth="20"
                            strokeDasharray={strokeDasharray}
                            style={{
                              transform: `rotate(${rotation}deg)`,
                              transformOrigin: '50% 50%',
                              transition: 'all 0.8s ease-in-out'
                            }}
                          />
                        );
                      });
                    })()}
                    <circle cx="50" cy="50" r="25" fill="#fbbf24" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl">⏰</span>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="flex-1 space-y-1">
                  {getExpiringSoonByCategory().map((cat, index) => {
                    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-orange-400', 'bg-red-400'];
                    return (
                      <div key={cat.category} className="flex items-center gap-2 text-xs">
                        <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                        <span className="opacity-90">{cat.icon} {cat.category}</span>
                        <span className="ml-auto font-bold">{cat.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {expandedCard !== 'expiring' && (
            <div className="mt-4 pt-4 border-t border-yellow-400 border-opacity-30">
              <p className="text-xs opacity-75">Use within 3 days</p>
            </div>
          )}
        </div>

        {/* Categories Card - Conditional rendering based on expansion */}
        {expandedCard !== 'expiring' && (
          <div 
            className={`glass-card-strong bg-gradient-to-br from-primary-500/90 to-primary-600/90 text-white transform transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer border-2 border-primary-400/30 ${showStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
            style={{ transitionDelay: '300ms' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium opacity-90">Categories</h3>
                <p className="text-4xl font-bold mt-2">
                  {Object.keys(summary?.inventory?.byCategory || {}).length}
                </p>
              </div>
              <div className="text-5xl opacity-80">🗂️</div>
            </div>
            <div className="mt-4 pt-4 border-t border-primary-400 border-opacity-30">
              <p className="text-xs opacity-75">Food types</p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Consumption Logs - Vertical Timeline */}
      <div className="glass-card-strong bg-gradient-to-br from-white/70 to-gray-100/50 hover:shadow-2xl transition-shadow duration-300 border-2 border-gray-300/40">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recent Food Logs</h2>
            <p className="text-sm text-gray-600">Your consumption history timeline</p>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="fruit">🍎 Fruit</option>
            <option value="vegetable">🥕 Vegetable</option>
            <option value="dairy">🥛 Dairy</option>
            <option value="grain">🌾 Grain</option>
            <option value="protein">🍖 Protein</option>
            <option value="beverage">🥤 Beverage</option>
            <option value="snack">🍪 Snack</option>
          </select>
        </div>
        {getFilteredLogs().length > 0 ? (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-400 via-primary-300 to-transparent"></div>
            
            {/* Timeline Items */}
            <div className="space-y-6 max-h-96 overflow-y-auto pr-2 smooth-scroll">
              {getFilteredLogs().map((log, index) => (
                <div
                  key={log._id}
                  className="relative pl-20 group"
                  style={{
                    animation: `fadeInLeft 0.6s ease-out ${index * 0.15}s both`
                  }}
                >
                  {/* Timeline Marker */}
                  <div className="absolute left-0 flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-300 border-4 border-white">
                      {getCategoryIcon(log.category)}
                    </div>
                  </div>

                  {/* Date Badge */}
                  <div className="absolute -left-1 top-16 bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs font-semibold shadow-sm">
                    {getTimeAgo(log.date)}
                  </div>

                  {/* Content Card */}
                  <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 border-2 border-gray-200 group-hover:border-primary-400 group-hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">{log.itemName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                            {log.category}
                          </span>
                          <span className="text-sm font-semibold text-gray-700">
                            📊 {log.quantity} units
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">
                          {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    {log.notes && (
                      <p className="text-sm text-gray-600 mt-2 italic">💬 {log.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Fade Out Effect at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-500 font-medium">No consumption logs yet</p>
            <p className="text-sm text-gray-400 mt-1">Start tracking your food consumption</p>
          </div>
        )}
      </div>

      {/* Recommended Resources - Swipeable Carousel */}
      <div className="glass-card-strong bg-gradient-to-br from-white/70 to-primary-100/50 hover:shadow-2xl transition-shadow duration-300 overflow-hidden border-2 border-primary-300/40">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Recommended for You</h2>
          <p className="text-sm text-gray-600">
            {summary?.recommendedResources?.explanation || 'Personalized sustainability resources'}
          </p>
        </div>
        
        {summary?.recommendedResources?.resources?.length > 0 ? (
          <div className="relative">
            {/* Carousel Container */}
            <div className="overflow-hidden" ref={carouselRef}>
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{
                  transform: `translateX(-${currentResourceIndex * 100}%)`
                }}
              >
                {summary.recommendedResources.resources.map((resource, index) => {
                  const isCurrent = index === currentResourceIndex;
                  const isPrev = index === currentResourceIndex - 1;
                  const isNext = index === currentResourceIndex + 1;
                  
                  return (
                    <div
                      key={resource._id}
                      className="w-full flex-shrink-0 px-4 transition-all duration-700"
                    >
                      <div
                        className={`p-8 bg-gradient-to-br from-primary-50 via-white to-purple-50 rounded-2xl border-2 transition-all duration-700 ${
                          isCurrent 
                            ? 'border-primary-400 shadow-2xl scale-100 opacity-100' 
                            : 'border-primary-100 shadow-md scale-95 opacity-60'
                        }`}
                        style={{
                          transform: isCurrent ? 'scale(1)' : 'scale(0.9)',
                        }}
                      >
                        <div className="text-center">
                          {/* Icon */}
                          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full mb-6 shadow-lg">
                            <span className="text-4xl">
                              {resource.type === 'video' ? '🎥' : 
                               resource.type === 'article' ? '📄' :
                               resource.type === 'guide' ? '📘' :
                               resource.type === 'recipe' ? '🍳' : '📚'}
                            </span>
                          </div>

                          {/* Content */}
                          <h3 className="text-2xl font-bold text-gray-900 mb-4">{resource.title}</h3>
                          <p className="text-gray-600 mb-6 leading-relaxed">{resource.description}</p>

                          {/* Tags */}
                          <div className="flex items-center justify-center gap-2 mb-6">
                            <span className="px-4 py-2 bg-primary-200 text-primary-800 text-sm font-medium rounded-full">
                              {resource.type}
                            </span>
                            <span className="px-4 py-2 bg-purple-200 text-purple-800 text-sm font-medium rounded-full">
                              {resource.relatedCategory}
                            </span>
                          </div>

                          {/* Learn More Button */}
                          {resource.url && (
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                              Learn More
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Arrows */}
            {summary.recommendedResources.resources.length > 1 && (
              <>
                <button
                  onClick={() => scrollCarousel('prev')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white hover:bg-primary-500 text-gray-700 hover:text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 z-10 border-2 border-primary-200"
                  aria-label="Previous resource"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => scrollCarousel('next')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white hover:bg-primary-500 text-gray-700 hover:text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 z-10 border-2 border-primary-200"
                  aria-label="Next resource"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Pagination Dots */}
            {summary.recommendedResources.resources.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {summary.recommendedResources.resources.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentResourceIndex(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentResourceIndex
                        ? 'w-8 h-3 bg-primary-500'
                        : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to resource ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💡</div>
            <p className="text-gray-500 font-medium">No recommendations available</p>
            <p className="text-sm text-gray-400 mt-1">Check back later for personalized tips</p>
          </div>
        )}
      </div>

      {/* Upload Section */}
      <div className="glass-card bg-gradient-to-br from-primary-100/40 to-white/60 border-2 border-primary-200/50">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-primary-600 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">Upload Food Image</h2>
            <p className="text-gray-600 mt-1">Upload images of your food items for better tracking</p>
          </div>
        </div>

        {/* Upload Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Upload Guidelines
          </h3>
          <ul className="text-sm text-blue-800 space-y-1 ml-7">
            <li>• <strong>Accepted formats:</strong> JPEG, JPG, PNG, GIF</li>
            <li>• <strong>Maximum file size:</strong> 5MB</li>
            <li>• <strong>Recommended:</strong> Clear, well-lit photos of food items</li>
            <li>• <strong>Purpose:</strong> Track inventory items visually</li>
          </ul>
        </div>

        <form onSubmit={handleFileUpload} className="space-y-4">
          <div className="relative">
            <label className="block">
              <div className="border-2 border-dashed border-primary-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer bg-white">
                {uploadFile ? (
                  <div className="space-y-2">
                    <svg className="w-12 h-12 mx-auto text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium text-gray-900">{uploadFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="hidden"
                />
              </div>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!uploadFile || uploadLoading}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploadLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Image
                </>
              )}
            </button>
            {uploadFile && (
              <button
                type="button"
                onClick={() => setUploadFile(null)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
