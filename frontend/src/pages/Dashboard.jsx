import { useState, useEffect } from 'react';
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
        <div className={`card bg-gradient-to-br from-blue-500 to-blue-600 text-white transform transition-all duration-500 hover:scale-105 hover:shadow-xl cursor-pointer ${showStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
             style={{ transitionDelay: '0ms' }}>
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

        <div className={`card bg-gradient-to-br from-red-500 to-red-600 text-white transform transition-all duration-500 hover:scale-105 hover:shadow-xl cursor-pointer ${showStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
             style={{ transitionDelay: '100ms' }}>
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

        <div className={`card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white transform transition-all duration-500 hover:scale-105 hover:shadow-xl cursor-pointer ${showStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
             style={{ transitionDelay: '200ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90">Expiring Soon</h3>
              <p className="text-4xl font-bold mt-2">{summary?.inventory?.expiringSoon || 0}</p>
            </div>
            <div className="text-5xl opacity-80">⏰</div>
          </div>
          <div className="mt-4 pt-4 border-t border-yellow-400 border-opacity-30">
            <p className="text-xs opacity-75">Use within 3 days</p>
          </div>
        </div>

        <div className={`card bg-gradient-to-br from-primary-500 to-primary-600 text-white transform transition-all duration-500 hover:scale-105 hover:shadow-xl cursor-pointer ${showStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
             style={{ transitionDelay: '300ms' }}>
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
      </div>

      {/* Recent Consumption Logs */}
      <div className="card hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recent Food Logs</h2>
            <p className="text-sm text-gray-600">Your consumption history</p>
          </div>
          <div className="flex gap-2">
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
        </div>
        {getFilteredLogs().length > 0 ? (
          <div className="space-y-2">
            {getFilteredLogs().slice(0, 5).map((log, index) => (
              <div
                key={log._id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:border-primary-300 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{getCategoryIcon(log.category)}</div>
                  <div>
                    <p className="font-medium text-gray-900">{log.itemName}</p>
                    <p className="text-sm text-gray-600">
                      {log.category} • {log.quantity} units
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    {new Date(log.date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-500 font-medium">No consumption logs yet</p>
            <p className="text-sm text-gray-400 mt-1">Start tracking your food consumption</p>
          </div>
        )}
      </div>

      {/* Recommended Resources */}
      <div className="card hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Recommended for You</h2>
        <p className="text-sm text-gray-600 mb-4">
          {summary?.recommendedResources?.explanation}
        </p>
        {summary?.recommendedResources?.resources?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.recommendedResources.resources.map((resource, index) => (
              <div
                key={resource._id}
                className="p-4 bg-gradient-to-br from-primary-50 to-white rounded-lg border-2 border-primary-100 hover:border-primary-300 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.15}s both`
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">📚</span>
                      <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 mb-3">{resource.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-primary-200 text-primary-800 text-xs font-medium rounded-full">
                        {resource.type}
                      </span>
                      <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-full">
                        {resource.relatedCategory}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
      <div className="card bg-gradient-to-br from-primary-50 to-white border-2 border-primary-100">
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
