import { useState, useEffect } from 'react';
import { consumptionAPI } from '../api';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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

      <div className="card">
        {logs.length > 0 ? (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{log.itemName}</h3>
                  <p className="text-sm text-gray-600">
                    {log.quantity} units • {log.category}
                  </p>
                  {log.notes && <p className="text-sm text-gray-500 mt-1">{log.notes}</p>}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {new Date(log.date).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDelete(log._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No logs yet. Add your first consumption log!</p>
        )}
      </div>
    </div>
  );
};

export default Logs;
