import { useState, useEffect, useMemo } from 'react';
import { consumptionAPI, inventoryAPI } from '../api';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inventoryItems, setInventoryItems] = useState([]);
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: '',
    category: 'other',
    notes: ''
  });

  useEffect(() => {
    loadLogs();
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const response = await inventoryAPI.getInventory();
      setInventoryItems(response.data.items || []);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    }
  };

  const loadLogs = async () => {
    try {
      const response = await consumptionAPI.getLogs();
      setLogs(response.data.logs);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await consumptionAPI.createLog(formData);
      setFormData({ itemName: '', quantity: '', category: 'other', notes: '' });
      setShowQuickAdd(false);
      loadLogs();
    } catch (error) {
      alert('Failed to create log');
    }
  };

  const quickAddItem = async (itemName, category) => {
    setFormData({ ...formData, itemName, category, quantity: '1' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this log?')) {
      try {
        await consumptionAPI.deleteLog(id);
        loadLogs();
      } catch (error) {
        alert('Failed to delete log');
      }
    }
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      fruit: '🍎',
      vegetable: '🥕',
      dairy: '🥛',
      grain: '🌾',
      protein: '🍗',
      beverage: '🥤',
      snack: '🍿',
      other: '📦'
    };
    return emojis[category] || '📦';
  };

  const getCategoryColor = (category) => {
    const colors = {
      fruit: 'bg-red-100 text-red-700 border-red-300',
      vegetable: 'bg-green-100 text-green-700 border-green-300',
      dairy: 'bg-blue-100 text-blue-700 border-blue-300',
      grain: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      protein: 'bg-orange-100 text-orange-700 border-orange-300',
      beverage: 'bg-cyan-100 text-cyan-700 border-cyan-300',
      snack: 'bg-purple-100 text-purple-700 border-purple-300',
      other: 'bg-gray-100 text-gray-700 border-gray-300'
    };
    return colors[category] || colors.other;
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

  const filteredLogs = logs
    .filter(log => filterCategory === 'all' || log.category === filterCategory)
    .filter(log => 
      searchQuery === '' || 
      log.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.notes && log.notes.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  // Calculate pie chart data
  const chartData = useMemo(() => {
    const logsToChart = filterCategory === 'all' ? logs : filteredLogs;
    const categoryTotals = {};
    
    logsToChart.forEach(log => {
      if (!categoryTotals[log.category]) {
        categoryTotals[log.category] = 0;
      }
      categoryTotals[log.category] += parseFloat(log.quantity) || 0;
    });

    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    
    const colors = {
      fruit: '#ef4444',
      vegetable: '#22c55e',
      dairy: '#3b82f6',
      grain: '#eab308',
      protein: '#f97316',
      beverage: '#06b6d4',
      snack: '#a855f7',
      other: '#6b7280'
    };

    let currentAngle = 0;
    const segments = Object.entries(categoryTotals).map(([category, value]) => {
      const percentage = (value / total) * 100;
      const angle = (percentage / 100) * 360;
      const segment = {
        category,
        value,
        percentage,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        color: colors[category] || colors.other
      };
      currentAngle += angle;
      return segment;
    });

    return { segments, total };
  }, [logs, filteredLogs, filterCategory]);

  // Smart suggestions from inventory
  const smartSuggestions = useMemo(() => {
    return inventoryItems
      .filter(item => item.daysUntilExpiration <= 3)
      .slice(0, 6)
      .map(item => ({
        name: item.itemName,
        category: item.category
      }));
  }, [inventoryItems]);

  if (loading) {
    return <div className="text-center py-8">Loading logs...</div>;
  }

  return (
    <div className="relative pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consumption Logs</h1>
          <p className="text-gray-600 mt-1">Track your food consumption journey</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-card mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search logs by item name or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="glass-card mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              filterCategory === 'all' 
                ? 'bg-blue-500 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({logs.length})
          </button>
          {['fruit', 'vegetable', 'dairy', 'grain', 'protein', 'beverage', 'snack', 'other'].map(cat => {
            const count = logs.filter(l => l.category === cat).length;
            return count > 0 ? (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap border-2 ${
                  filterCategory === cat 
                    ? getCategoryColor(cat) + ' shadow-lg' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {getCategoryEmoji(cat)} {cat.charAt(0).toUpperCase() + cat.slice(1)} ({count})
              </button>
            ) : null;
          })}
        </div>
      </div>

      {/* Dynamic Pie Chart */}
      {chartData.segments.length > 0 && (
        <div className="glass-card-strong mb-6 bg-gradient-to-br from-white/70 to-purple-100/50 border-2 border-purple-300/40">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Consumption Overview {filterCategory !== 'all' && `- ${filterCategory.charAt(0).toUpperCase() + filterCategory.slice(1)}`}
          </h2>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {/* Pie Chart */}
            <div className="relative">
              <svg width="220" height="220" viewBox="0 0 220 220" className="transform -rotate-90">
                <circle cx="110" cy="110" r="100" fill="#f3f4f6" />
                {chartData.segments.map((segment, index) => {
                  const startAngle = (segment.startAngle * Math.PI) / 180;
                  const endAngle = (segment.endAngle * Math.PI) / 180;
                  const x1 = 110 + 100 * Math.cos(startAngle);
                  const y1 = 110 + 100 * Math.sin(startAngle);
                  const x2 = 110 + 100 * Math.cos(endAngle);
                  const y2 = 110 + 100 * Math.sin(endAngle);
                  const largeArc = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
                  
                  return (
                    <path
                      key={segment.category}
                      d={`M 110 110 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`}
                      fill={segment.color}
                      className="transition-all duration-500 hover:opacity-80"
                      style={{
                        animation: `fadeIn 0.8s ease-out ${index * 0.1}s both`,
                        filter: filterCategory === segment.category ? 'brightness(1.2)' : 'none',
                        transform: filterCategory === segment.category ? 'scale(1.05)' : 'scale(1)',
                        transformOrigin: '110px 110px'
                      }}
                    />
                  );
                })}
                <circle cx="110" cy="110" r="60" fill="white" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{chartData.total.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Total Units</div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-3">
              {chartData.segments.map((segment) => (
                <div 
                  key={segment.category}
                  className={`flex items-center gap-2 p-2 rounded-lg transition-all cursor-pointer ${
                    filterCategory === segment.category ? 'bg-gray-100 ring-2 ring-gray-300' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setFilterCategory(segment.category)}
                >
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: segment.color }}
                  ></div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 capitalize flex items-center gap-1">
                      {getCategoryEmoji(segment.category)}
                      {segment.category}
                    </div>
                    <div className="text-xs text-gray-600">
                      {segment.value.toFixed(1)} units ({segment.percentage.toFixed(1)}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vertical Timeline */}
      <div className="glass-card-strong bg-gradient-to-br from-white/70 to-blue-100/50 border-2 border-blue-300/40">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Timeline</h2>
        {filteredLogs.length > 0 ? (
          <div className="relative max-h-[600px] overflow-y-auto smooth-scroll">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-400 via-primary-300 to-transparent"></div>
            
            {/* Timeline Entries */}
            <div className="space-y-6">
              {filteredLogs.map((log, index) => {
                const logDate = new Date(log.date);
                const isToday = logDate.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={log._id}
                    className="relative pl-24 group"
                    style={{
                      animation: `fadeInLeft 0.6s ease-out ${index * 0.1}s both`
                    }}
                  >
                    {/* Sticky Date Marker */}
                    <div className="absolute left-0 top-0 z-10">
                      <div className="sticky top-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg border-4 border-white transition-all duration-300 ${
                          isToday ? 'bg-gradient-to-br from-green-400 to-green-600 scale-110 animate-pulse-subtle' : 'bg-gradient-to-br from-primary-400 to-primary-600'
                        } group-hover:scale-125`}>
                          {getCategoryEmoji(log.category)}
                        </div>
                        {/* Date Badge */}
                        <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs font-bold shadow-sm whitespace-nowrap ${
                          isToday ? 'bg-green-500 text-white' : 'bg-primary-100 text-primary-700'
                        }`}>
                          {getTimeAgo(log.date)}
                        </div>
                      </div>
                    </div>

                    {/* Log Card */}
                    <div 
                      className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-5 border-2 border-gray-200 group-hover:border-primary-400 group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-xl text-gray-900">{log.itemName}</h3>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(log.category)}`}>
                              {log.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="font-semibold">📊 {log.quantity} units</span>
                            <span className="text-gray-400">•</span>
                            <span>📅 {logDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className="text-gray-400">•</span>
                            <span>🕐 {logDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          {log.notes && (
                            <p className="text-sm text-gray-600 mt-3 italic bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                              💬 {log.notes}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(log._id);
                          }}
                          className="ml-4 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Hover Indicator */}
                      <div className="text-xs text-gray-500 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                        Click for more details →
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scroll Fade Effect */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-500 font-medium">
              {filterCategory === 'all' 
                ? 'No logs yet. Click the + button to add your first log!' 
                : `No logs found in the "${filterCategory}" category.`}
            </p>
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setShowQuickAdd(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl font-bold hover:scale-110 active:scale-95 transition-all duration-300 z-50 animate-bounce-subtle"
        aria-label="Add Log"
      >
        <span className="text-3xl">+</span>
      </button>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowQuickAdd(false)}>
          <div 
            className="glass-card-strong rounded-2xl max-w-md w-full p-6 shadow-2xl transform transition-all animate-scale-in border-2 border-white/50" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-3xl">✨</span>
                Quick Add Log
              </h2>
              <button
                onClick={() => setShowQuickAdd(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Smart Suggestions */}
            {smartSuggestions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">💡 Expiring Soon - Quick Log</h3>
                <div className="grid grid-cols-3 gap-2">
                  {smartSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => quickAddItem(suggestion.name, suggestion.category)}
                      className="p-3 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg hover:border-green-400 hover:shadow-lg transition-all text-center group"
                    >
                      <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{getCategoryEmoji(suggestion.category)}</div>
                      <div className="text-xs font-semibold text-gray-700 truncate">{suggestion.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  required
                  placeholder="e.g., Milk, Apple, Coffee"
                  className="input-field"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                    min={0}
                    step="0.1"
                    placeholder="1"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                  >
                    <option value="fruit">🍎 Fruit</option>
                    <option value="vegetable">🥕 Vegetable</option>
                    <option value="dairy">🥛 Dairy</option>
                    <option value="grain">🌾 Grain</option>
                    <option value="protein">🍗 Protein</option>
                    <option value="beverage">🥤 Beverage</option>
                    <option value="snack">🍿 Snack</option>
                    <option value="other">📦 Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field"
                  rows={2}
                  placeholder="Any additional details..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
                >
                  ✅ Add Log
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuickAdd(false)}
                  className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedLog(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-5xl">{getCategoryEmoji(selectedLog.category)}</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedLog.itemName}</h2>
                  <span className={`inline-block mt-1 px-3 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(selectedLog.category)}`}>
                    {selectedLog.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Quantity Display */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-blue-200">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-1">{selectedLog.quantity}</div>
                  <div className="text-sm text-gray-600">Units Consumed</div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">📅 Date</span>
                  <span className="font-bold text-gray-900">{new Date(selectedLog.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">🕐 Time</span>
                  <span className="font-bold text-gray-900">{new Date(selectedLog.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">⏰ Logged</span>
                  <span className="font-bold text-gray-900">{getTimeAgo(selectedLog.date)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">🏷️ Category</span>
                  <span className="font-bold text-gray-900 capitalize">{selectedLog.category}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedLog.notes && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="font-semibold text-gray-700 mb-1">📝 Notes</div>
                  <p className="text-gray-600 text-sm">{selectedLog.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedLog(null);
                    handleDelete(selectedLog._id);
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  🗑️ Delete Log
                </button>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logs;
