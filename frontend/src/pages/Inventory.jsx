import { useState, useEffect } from 'react';
import { inventoryAPI } from '../api';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [countdown, setCountdown] = useState({});
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'other',
    quantity: '',
    expirationDate: '',
    notes: ''
  });

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    // Update countdown every second
    const timer = setInterval(() => {
      const newCountdown = {};
      items.forEach(item => {
        const now = new Date();
        const expDate = new Date(item.expirationDate);
        const diff = expDate - now;
        
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          newCountdown[item._id] = { days, hours, minutes, seconds, expired: false };
        } else {
          newCountdown[item._id] = { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
        }
      });
      setCountdown(newCountdown);
    }, 1000);

    return () => clearInterval(timer);
  }, [items]);

  const loadInventory = async () => {
    try {
      const response = await inventoryAPI.getInventory();
      setItems(response.data.items);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await inventoryAPI.createItem(formData);
      setFormData({ itemName: '', category: 'other', quantity: '', expirationDate: '', notes: '' });
      setShowForm(false);
      loadInventory();
    } catch (error) {
      alert('Failed to create item');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this item?')) {
      try {
        await inventoryAPI.deleteItem(id);
        loadInventory();
      } catch (error) {
        alert('Failed to delete item');
      }
    }
  };

  const getExpirationStatus = (daysUntil) => {
    if (daysUntil < 0) return { color: 'bg-red-100 text-red-800 border-red-300', icon: '⚠️', label: 'Expired' };
    if (daysUntil <= 3) return { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '⏰', label: 'Expiring Soon' };
    if (daysUntil <= 7) return { color: 'bg-orange-100 text-orange-800 border-orange-300', icon: '📅', label: 'Use Soon' };
    return { color: 'bg-green-100 text-green-800 border-green-300', icon: '✓', label: 'Fresh' };
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

  if (loading) {
    return <div className="text-center py-8">Loading inventory...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Food Inventory</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : 'Add Item'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">New Inventory Item</h2>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiration Date
                </label>
                <input
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                  required
                  className="input-field"
                />
              </div>
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
              Add Item
            </button>
          </form>
        </div>
      )}

      <div className="card">
        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, index) => {
              const status = getExpirationStatus(item.daysUntilExpiration);
              const timer = countdown[item._id] || { days: 0, hours: 0, minutes: 0, seconds: 0, expired: false };
              return (
                <div 
                  key={item._id} 
                  className="group relative p-5 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setSelectedItem(item)}
                >
                  {/* Category Badge */}
                  <div className="absolute top-3 right-3 text-3xl opacity-20 group-hover:opacity-40 transition-opacity">
                    {getCategoryEmoji(item.category)}
                  </div>
                  
                  <div className="mb-3">
                    <h3 className="font-bold text-lg text-gray-900 mb-1 flex items-center gap-2">
                      {getCategoryEmoji(item.category)}
                      {item.itemName}
                    </h3>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full border ${status.color}`}>
                      {status.icon} {status.label}
                    </span>
                  </div>

                  {/* Countdown Timer */}
                  {!timer.expired ? (
                    <div className="grid grid-cols-4 gap-2 mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{timer.days}</div>
                        <div className="text-xs text-gray-600">Days</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{timer.hours}</div>
                        <div className="text-xs text-gray-600">Hrs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{timer.minutes}</div>
                        <div className="text-xs text-gray-600">Min</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{timer.seconds}</div>
                        <div className="text-xs text-gray-600">Sec</div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3 p-3 bg-red-50 rounded-lg border border-red-200 text-center">
                      <span className="text-red-600 font-bold">⚠️ EXPIRED</span>
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-semibold text-gray-900">{item.quantity} units</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Expires:</span>
                      <span className="font-medium text-gray-700">{new Date(item.expirationDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Hover Indicator */}
                  <div className="mt-3 pt-3 border-t border-gray-200 text-center text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click for details
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item._id);
                    }}
                    className="absolute top-3 left-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No inventory items yet. Add your first item!</p>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-5xl">{getCategoryEmoji(selectedItem.category)}</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedItem.itemName}</h2>
                  <span className="text-sm text-gray-500 capitalize">{selectedItem.category}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Status Badge */}
              <div className={`p-4 rounded-lg border-2 ${getExpirationStatus(selectedItem.daysUntilExpiration).color}`}>
                <div className="text-center">
                  <div className="text-3xl mb-2">{getExpirationStatus(selectedItem.daysUntilExpiration).icon}</div>
                  <div className="font-bold text-lg">{getExpirationStatus(selectedItem.daysUntilExpiration).label}</div>
                </div>
              </div>

              {/* Live Countdown */}
              {countdown[selectedItem._id] && !countdown[selectedItem._id].expired && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-blue-200">
                  <div className="text-center mb-2 text-sm font-semibold text-gray-700">Time Until Expiration</div>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded-lg shadow">
                      <div className="text-2xl font-bold text-blue-600">{countdown[selectedItem._id].days}</div>
                      <div className="text-xs text-gray-600">Days</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow">
                      <div className="text-2xl font-bold text-blue-600">{countdown[selectedItem._id].hours}</div>
                      <div className="text-xs text-gray-600">Hours</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow">
                      <div className="text-2xl font-bold text-blue-600">{countdown[selectedItem._id].minutes}</div>
                      <div className="text-xs text-gray-600">Minutes</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow">
                      <div className="text-2xl font-bold text-blue-600">{countdown[selectedItem._id].seconds}</div>
                      <div className="text-xs text-gray-600">Seconds</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Quantity</span>
                  <span className="font-bold text-gray-900">{selectedItem.quantity} units</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Expiration Date</span>
                  <span className="font-bold text-gray-900">{new Date(selectedItem.expirationDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Days Until Expiration</span>
                  <span className="font-bold text-gray-900">{selectedItem.daysUntilExpiration} days</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Added On</span>
                  <span className="font-bold text-gray-900">{new Date(selectedItem.dateAdded).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedItem.notes && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="font-semibold text-gray-700 mb-1">📝 Notes</div>
                  <p className="text-gray-600 text-sm">{selectedItem.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    handleDelete(selectedItem._id);
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  🗑️ Delete Item
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
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

export default Inventory;
