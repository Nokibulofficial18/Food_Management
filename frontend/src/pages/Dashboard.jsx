import { useState, useEffect } from 'react';
import { summaryAPI, uploadAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    loadSummary();
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
    const formData = new FormData();
    formData.append('image', uploadFile);

    try {
      await uploadAPI.uploadFile(formData);
      setUploadFile(null);
      alert('File uploaded successfully!');
    } catch (error) {
      alert('Failed to upload file');
    } finally {
      setUploadLoading(false);
    }
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-right">
          <p className="text-sm text-gray-600">Welcome back,</p>
          <p className="font-semibold text-gray-900">{user?.fullName}</p>
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <h3 className="text-sm font-medium opacity-90">Total Items</h3>
          <p className="text-3xl font-bold mt-2">{summary?.inventory?.total || 0}</p>
        </div>
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <h3 className="text-sm font-medium opacity-90">Expired</h3>
          <p className="text-3xl font-bold mt-2">{summary?.inventory?.expired || 0}</p>
        </div>
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <h3 className="text-sm font-medium opacity-90">Expiring Soon</h3>
          <p className="text-3xl font-bold mt-2">{summary?.inventory?.expiringSoon || 0}</p>
        </div>
        <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <h3 className="text-sm font-medium opacity-90">Categories</h3>
          <p className="text-3xl font-bold mt-2">
            {Object.keys(summary?.inventory?.byCategory || {}).length}
          </p>
        </div>
      </div>

      {/* Recent Consumption Logs */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Food Logs</h2>
        {summary?.consumption?.recentLogs?.length > 0 ? (
          <div className="space-y-2">
            {summary.consumption.recentLogs.slice(0, 5).map((log) => (
              <div key={log._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{log.itemName}</p>
                  <p className="text-sm text-gray-600">
                    {log.category} • {log.quantity} units
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(log.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No consumption logs yet</p>
        )}
      </div>

      {/* Recommended Resources */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Recommended for You</h2>
        <p className="text-sm text-gray-600 mb-4">
          {summary?.recommendedResources?.explanation}
        </p>
        {summary?.recommendedResources?.resources?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.recommendedResources.resources.map((resource) => (
              <div key={resource._id} className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-1 bg-primary-200 text-primary-800 text-xs rounded">
                        {resource.type}
                      </span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                        {resource.relatedCategory}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No recommendations available</p>
        )}
      </div>

      {/* Upload Section */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Image</h2>
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setUploadFile(e.target.files[0])}
              className="input-field"
            />
          </div>
          <button
            type="submit"
            disabled={!uploadFile || uploadLoading}
            className="btn-primary disabled:opacity-50"
          >
            {uploadLoading ? 'Uploading...' : 'Upload Image'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
