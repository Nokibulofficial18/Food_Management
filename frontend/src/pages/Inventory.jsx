import { useState, useEffect } from 'react';
import { inventoryAPI } from '../api';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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

  const getExpirationStatus = (expirationDate, daysUntil) => {
    if (daysUntil < 0) return { color: 'text-red-600', label: 'Expired' };
    if (daysUntil <= 3) return { color: 'text-yellow-600', label: `${daysUntil}d left` };
    return { color: 'text-green-600', label: `${daysUntil}d left` };
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
            {items.map((item) => {
              const status = getExpirationStatus(item.expirationDate, item.daysUntilExpiration);
              return (
                <div key={item._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{item.itemName}</h3>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">
                      Quantity: <span className="font-medium">{item.quantity}</span>
                    </p>
                    <p className="text-gray-600">
                      Category: <span className="font-medium">{item.category}</span>
                    </p>
                    <p className={status.color}>
                      <span className="font-medium">{status.label}</span>
                    </p>
                    {item.notes && (
                      <p className="text-gray-500 mt-2">{item.notes}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No inventory items yet. Add your first item!</p>
        )}
      </div>
    </div>
  );
};

export default Inventory;
