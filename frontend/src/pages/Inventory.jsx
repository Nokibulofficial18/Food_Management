import { useState, useEffect } from 'react';
import { inventoryAPI } from '../api';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [countdown, setCountdown] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropZoneHover, setDropZoneHover] = useState(null);
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

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target);
    // Add visual feedback
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
    setDropZoneHover(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, action) => {
    e.preventDefault();
    setDropZoneHover(null);
    
    if (!draggedItem) return;

    try {
      switch (action) {
        case 'consume':
          // Log consumption and optionally delete
          alert(`Consumed: ${draggedItem.itemName}`);
          // You can implement actual consumption logging here
          await inventoryAPI.deleteItem(draggedItem._id);
          break;
        case 'waste':
          // Log as waste
          alert(`Logged as waste: ${draggedItem.itemName}`);
          await inventoryAPI.deleteItem(draggedItem._id);
          break;
        case 'freeze':
          // Update expiration or mark as frozen
          alert(`Frozen: ${draggedItem.itemName}`);
          break;
        default:
          break;
      }
      loadInventory();
    } catch (error) {
      console.error('Failed to process action:', error);
    }
    
    setDraggedItem(null);
  };

  const getTimerFillPercentage = (daysUntil) => {
    if (daysUntil < 0) return 100;
    if (daysUntil >= 7) return 10;
    return 100 - ((daysUntil / 7) * 90);
  };

  const getTimerColor = (daysUntil) => {
    if (daysUntil < 0) return '#dc2626'; // red-600
    if (daysUntil <= 2) return '#ef4444'; // red-500
    if (daysUntil <= 4) return '#f97316'; // orange-500
    if (daysUntil <= 6) return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
  };

  const filteredItems = items.filter(item =>
    searchQuery === '' ||
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return <div className="text-center py-8">Loading inventory...</div>;
  }

  return (
    <div className="relative">
      {/* Drop Zones - Fixed on Right Side */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 space-y-4">
        {/* Consume Zone */}
        <div
          className={`w-48 h-32 rounded-2xl border-4 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${
            dropZoneHover === 'consume'
              ? 'bg-green-500 border-green-600 shadow-2xl scale-110 animate-pulse-glow-green'
              : draggedItem
              ? 'bg-green-50 border-green-400 border-dashed shadow-lg'
              : 'bg-green-100 border-green-300 opacity-50'
          }`}
          onDragOver={handleDragOver}
          onDragEnter={() => setDropZoneHover('consume')}
          onDragLeave={() => setDropZoneHover(null)}
          onDrop={(e) => handleDrop(e, 'consume')}
        >
          <div className={`text-4xl mb-2 transition-transform ${dropZoneHover === 'consume' ? 'scale-125' : ''}`}>
            ✅
          </div>
          <span className={`font-bold text-sm ${dropZoneHover === 'consume' ? 'text-white' : 'text-green-700'}`}>
            CONSUME
          </span>
        </div>

        {/* Log Waste Zone */}
        <div
          className={`w-48 h-32 rounded-2xl border-4 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${
            dropZoneHover === 'waste'
              ? 'bg-red-500 border-red-600 shadow-2xl scale-110 animate-pulse-glow-red'
              : draggedItem
              ? 'bg-red-50 border-red-400 border-dashed shadow-lg'
              : 'bg-red-100 border-red-300 opacity-50'
          }`}
          onDragOver={handleDragOver}
          onDragEnter={() => setDropZoneHover('waste')}
          onDragLeave={() => setDropZoneHover(null)}
          onDrop={(e) => handleDrop(e, 'waste')}
        >
          <div className={`text-4xl mb-2 transition-transform ${dropZoneHover === 'waste' ? 'scale-125' : ''}`}>
            🗑️
          </div>
          <span className={`font-bold text-sm ${dropZoneHover === 'waste' ? 'text-white' : 'text-red-700'}`}>
            LOG WASTE
          </span>
        </div>

        {/* Freeze Zone */}
        <div
          className={`w-48 h-32 rounded-2xl border-4 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${
            dropZoneHover === 'freeze'
              ? 'bg-blue-500 border-blue-600 shadow-2xl scale-110 animate-pulse-glow-blue'
              : draggedItem
              ? 'bg-blue-50 border-blue-400 border-dashed shadow-lg'
              : 'bg-blue-100 border-blue-300 opacity-50'
          }`}
          onDragOver={handleDragOver}
          onDragEnter={() => setDropZoneHover('freeze')}
          onDragLeave={() => setDropZoneHover(null)}
          onDrop={(e) => handleDrop(e, 'freeze')}
        >
          <div className={`text-4xl mb-2 transition-transform ${dropZoneHover === 'freeze' ? 'scale-125' : ''}`}>
            ❄️
          </div>
          <span className={`font-bold text-sm ${dropZoneHover === 'freeze' ? 'text-white' : 'text-blue-700'}`}>
            FREEZE
          </span>
        </div>
      </div>

      {/* Drag Instruction Overlay */}
      {draggedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-20 pointer-events-none z-40 flex items-center justify-center">
          <div className="bg-white px-8 py-4 rounded-lg shadow-2xl animate-bounce">
            <p className="text-lg font-bold text-gray-900">
              🎯 Drag to a zone on the right →
            </p>
          </div>
        </div>
      )}

      {/* Main Content Area with margin to avoid overlap with drop zones */}
      <div className="mr-60">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Food Inventory</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            {showForm ? 'Cancel' : 'Add Item'}
          </button>
        </div>

      {/* Search Bar */}
      <div className="glass-card mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search inventory by item name, category, or notes..."
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
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item, index) => {
              const status = getExpirationStatus(item.daysUntilExpiration);
              const timer = countdown[item._id] || { days: 0, hours: 0, minutes: 0, seconds: 0, expired: false };
              const timerFill = getTimerFillPercentage(item.daysUntilExpiration);
              const timerColor = getTimerColor(item.daysUntilExpiration);
              const isDragging = draggedItem?._id === item._id;
              
              return (
                <div 
                  key={item._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragEnd={handleDragEnd}
                  className={`group relative p-5 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 transition-all duration-300 cursor-move transform ${
                    isDragging 
                      ? 'border-blue-500 shadow-2xl shadow-blue-500/50 scale-105 rotate-2' 
                      : 'border-gray-200 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1'
                  }`}
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    boxShadow: isDragging ? '0 0 30px rgba(59, 130, 246, 0.5)' : undefined
                  }}
                  onClick={() => !isDragging && setSelectedItem(item)}
                >
                  {/* Animated Liquid Timer Sphere - Top Right */}
                  <div className="absolute -top-3 -right-3 w-16 h-16 z-10">
                    <div className="relative w-full h-full">
                      {/* Outer sphere */}
                      <div className="absolute inset-0 rounded-full bg-white border-4 border-gray-300 shadow-lg overflow-hidden">
                        {/* Liquid fill with draining animation */}
                        <div 
                          className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out"
                          style={{
                            height: `${timerFill}%`,
                            backgroundColor: timerColor,
                            animation: 'liquidWave 2s ease-in-out infinite'
                          }}
                        >
                          {/* Wave effect */}
                          <div 
                            className="absolute top-0 left-0 right-0 h-2 opacity-50"
                            style={{
                              backgroundColor: timerColor,
                              animation: 'wave 1.5s ease-in-out infinite'
                            }}
                          />
                        </div>
                        {/* Glass shine effect */}
                        <div className="absolute top-2 left-2 w-4 h-4 bg-white rounded-full opacity-40"></div>
                      </div>
                      {/* Timer label */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-700 drop-shadow-md">
                          {item.daysUntilExpiration}d
                        </span>
                      </div>
                      {/* Pulsing ring for urgent items */}
                      {item.daysUntilExpiration <= 2 && (
                        <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping"></div>
                      )}
                    </div>
                  </div>

                  {/* Drag Handle Indicator */}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex flex-col gap-1">
                      <div className="w-6 h-0.5 bg-gray-400 rounded"></div>
                      <div className="w-6 h-0.5 bg-gray-400 rounded"></div>
                      <div className="w-6 h-0.5 bg-gray-400 rounded"></div>
                    </div>
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 right-20 text-3xl opacity-20 group-hover:opacity-40 transition-opacity">
                    {getCategoryEmoji(item.category)}
                  </div>
                  
                  <div className="mb-3 mt-4">
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

                  {/* Drag Instructions */}
                  <div className="mt-3 pt-3 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      🖱️ Drag to consume, waste, or freeze
                    </p>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item._id);
                    }}
                    className="absolute bottom-3 left-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg z-20"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            {searchQuery ? `No items found matching "${searchQuery}"` : 'No inventory items yet. Add your first item!'}
          </p>
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
    </div>
  );
};

export default Inventory;
