import { useState, useEffect } from 'react';
import { consumptionAPI } from '../api';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: '',
    category: 'other',
    notes: ''
  });

  useEffect(() => {
    loadLogs();
  }, []);

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
      setShowForm(false);
      loadLogs();
    } catch (error) {
      alert('Failed to create log');
    }
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

  const filteredLogs = filterCategory === 'all' 
    ? logs 
    : logs.filter(log => log.category === filterCategory);

  if (loading) {
    return <div className="text-center py-8">Loading logs...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Consumption Logs</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : 'Add Log'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">New Consumption Log</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                  min={0}
                  step="0.1"
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
              >
                <option value="fruit">Fruit</option>
                <option value="vegetable">Vegetable</option>
                <option value="dairy">Dairy</option>
                <option value="grain">Grain</option>
                <option value="protein">Protein</option>
                <option value="beverage">Beverage</option>
                <option value="snack">Snack</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-field"
                rows={3}
              />
            </div>
            <button type="submit" className="btn-primary">
              Add Log
            </button>
          </form>
        </div>
      )}

      {/* Category Filter */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
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

      <div className="card">
        {filteredLogs.length > 0 ? (
          <div className="space-y-3">
            {filteredLogs.map((log, index) => (
              <div 
                key={log._id} 
                className="group relative flex items-center justify-between p-5 bg-gradient-to-r from-white to-gray-50 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 cursor-pointer"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => setSelectedLog(log)}
              >
                <div className="flex-1 flex items-center gap-4">
                  <div className="text-4xl opacity-60 group-hover:scale-110 transition-transform">
                    {getCategoryEmoji(log.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg text-gray-900">{log.itemName}</h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(log.category)}`}>
                        {log.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-semibold">📊 {log.quantity} units</span>
                      <span className="text-gray-400">•</span>
                      <span>🕐 {getTimeAgo(log.date)}</span>
                      <span className="text-gray-400">•</span>
                      <span>📅 {new Date(log.date).toLocaleDateString()}</span>
                    </div>
                    {log.notes && (
                      <p className="text-sm text-gray-500 mt-2 italic">💬 {log.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click for details
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(log._id);
                    }}
                    className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            {filterCategory === 'all' 
              ? 'No logs yet. Add your first consumption log!' 
              : `No logs found in the "${filterCategory}" category.`}
          </p>
        )}
      </div>

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
