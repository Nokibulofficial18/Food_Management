import { useState, useEffect } from 'react';
import { aiAPI } from '../api';

const ExpirationRisk = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const [filterLevel, setFilterLevel] = useState('all'); // 'all', 'critical', 'high', etc.

  useEffect(() => {
    fetchExpirationRisk();
  }, []);

  const fetchExpirationRisk = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await aiAPI.getExpirationRisk();
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load expiration risk data');
      console.error('Error fetching expiration risk:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (level) => {
    const badges = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300',
      minimal: 'bg-green-100 text-green-800 border-green-300'
    };
    return badges[level] || badges.minimal;
  };

  const getRiskIcon = (icon) => {
    const icons = {
      '🚨': '🚨',
      '⚠️': '⚠️',
      '⚡': '⚡',
      '✅': '✅',
      '🟢': '🟢'
    };
    return icons[icon] || '📦';
  };

  const getRecommendationIcon = (type) => {
    const icons = {
      discard: '🗑️',
      consume: '🍽️',
      cook: '👨‍🍳',
      plan: '📋',
      preserve: '🧊',
      share: '🤝'
    };
    return icons[type] || '💡';
  };

  const filteredItems = data?.prioritizedInventory.filter(item => {
    if (filterLevel === 'all') return true;
    return item.riskLevel === filterLevel;
  }) || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button 
          onClick={fetchExpirationRisk}
          className="mt-2 text-red-600 hover:text-red-800 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data || data.summary.totalItems === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-600 text-lg">No inventory items found</p>
        <p className="text-gray-500 mt-2">Add items to your inventory to see expiration risk predictions</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Expiration Risk Predictions</h1>
          <p className="text-gray-600 mt-1">AI-powered spoilage prevention</p>
        </div>
        <button
          onClick={fetchExpirationRisk}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
        >
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      {/* Seasonal Insight */}
      {data.seasonalInsight && (
        <div className={`p-4 rounded-lg border-2 ${
          data.seasonalInsight.season === 'summer' 
            ? 'bg-orange-50 border-orange-300' 
            : 'bg-blue-50 border-blue-300'
        }`}>
          <div className="flex items-start space-x-3">
            <span className="text-2xl">{data.seasonalInsight.season === 'summer' ? '☀️' : '❄️'}</span>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 capitalize">{data.seasonalInsight.season} Season Alert</h3>
              <p className="text-gray-700 mt-1">{data.seasonalInsight.message}</p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Recommendation:</strong> {data.seasonalInsight.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
          <div className="text-2xl font-bold text-gray-800">{data.summary.totalItems}</div>
          <div className="text-sm text-gray-600">Total Items</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border-2 border-red-300">
          <div className="text-2xl font-bold text-red-800">{data.summary.criticalItems}</div>
          <div className="text-sm text-red-700">Critical</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-300">
          <div className="text-2xl font-bold text-orange-800">{data.summary.highRiskItems}</div>
          <div className="text-sm text-orange-700">High Risk</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300">
          <div className="text-2xl font-bold text-yellow-800">{data.summary.mediumRiskItems}</div>
          <div className="text-sm text-yellow-700">Medium Risk</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
          <div className="text-2xl font-bold text-blue-800">{data.summary.lowRiskItems}</div>
          <div className="text-sm text-blue-700">Low Risk</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
          <div className="text-2xl font-bold text-green-800">{data.summary.minimalRiskItems}</div>
          <div className="text-sm text-green-700">Minimal Risk</div>
        </div>
      </div>

      {/* Alerts Section */}
      {data.alerts && data.alerts.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-4 flex items-center space-x-2">
            <span>🚨</span>
            <span>Urgent Alerts ({data.alerts.length})</span>
          </h2>
          <div className="space-y-3">
            {data.alerts.slice(0, 5).map((alert, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg border border-red-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{alert.icon}</span>
                      <span className="font-semibold text-gray-800">{alert.itemName}</span>
                      <span className="text-sm text-gray-500">({alert.category})</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-2">{alert.alert}</p>
                    <p className="text-sm text-red-600 mt-1 font-medium">
                      Action: {alert.action}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-700">{alert.riskScore}</div>
                    <div className="text-xs text-gray-600">risk score</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {alert.daysUntilExpiration < 0 
                        ? `Expired ${Math.abs(alert.daysUntilExpiration)}d ago` 
                        : `${alert.daysUntilExpiration}d left`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Risk Breakdown */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Category Risk Breakdown</h2>
        <div className="space-y-3">
          {data.categoryRisk?.map((cat, idx) => (
            <div key={idx} className="flex items-center space-x-4">
              <div className="w-32 text-sm font-medium text-gray-700 capitalize">{cat.category}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div 
                  className={`h-full rounded-full transition-all ${
                    cat.averageRisk >= 80 ? 'bg-red-500' :
                    cat.averageRisk >= 60 ? 'bg-orange-500' :
                    cat.averageRisk >= 40 ? 'bg-yellow-500' :
                    cat.averageRisk >= 20 ? 'bg-blue-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${cat.averageRisk}%` }}
                ></div>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-800">
                  {cat.averageRisk}/100
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {cat.highRiskCount > 0 && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                    {cat.highRiskCount} high-risk
                  </span>
                )}
              </div>
              <div className="w-24 text-sm text-gray-600 text-right">{cat.totalItems} items</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and View Controls */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {['all', 'critical', 'high', 'medium', 'low', 'minimal'].map(level => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                filterLevel === level
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setView('grid')}
            className={`px-4 py-2 rounded-lg ${
              view === 'grid' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg ${
              view === 'list' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Inventory Items */}
      <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
        {filteredItems.map((item) => (
          <div 
            key={item.id} 
            className={`bg-white rounded-lg border-2 p-4 hover:shadow-lg transition ${
              item.riskLevel === 'critical' ? 'border-red-400' :
              item.riskLevel === 'high' ? 'border-orange-400' :
              item.riskLevel === 'medium' ? 'border-yellow-400' :
              item.riskLevel === 'low' ? 'border-blue-400' : 'border-green-400'
            }`}
          >
            {/* Item Header */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{getRiskIcon(item.icon)}</span>
                  <h3 className="font-semibold text-gray-800">{item.itemName}</h3>
                </div>
                <p className="text-sm text-gray-600 capitalize">{item.category}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold" style={{ color: item.riskColor }}>
                  {item.riskScore}
                </div>
                <div className="text-xs text-gray-600">risk</div>
              </div>
            </div>

            {/* Risk Badge */}
            <div className={`inline-flex items-center px-3 py-1 rounded-full border-2 text-sm font-medium mb-3 ${getRiskBadge(item.riskLevel)}`}>
              <span className="capitalize">{item.riskLevel}</span>
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{item.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Days until expiration:</span>
                <span className={`font-medium ${
                  item.daysUntilExpiration < 0 ? 'text-red-600' :
                  item.daysUntilExpiration <= 3 ? 'text-orange-600' : 'text-gray-800'
                }`}>
                  {item.isExpired 
                    ? `Expired ${Math.abs(item.daysUntilExpiration)}d ago` 
                    : `${item.daysUntilExpiration} days`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Consumption frequency:</span>
                <span className="font-medium">{item.consumptionFrequency.toFixed(1)}x/week</span>
              </div>
            </div>

            {/* Risk Breakdown */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-600 mb-2">Risk Factors:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Expiration:</span>
                  <span className="font-medium">{item.riskBreakdown.expiration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Perishability:</span>
                  <span className="font-medium">{item.riskBreakdown.perishability}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Seasonal:</span>
                  <span className="font-medium">{item.riskBreakdown.seasonal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Consumption:</span>
                  <span className="font-medium">{item.riskBreakdown.consumption}</span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {item.recommendations && item.recommendations.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-600 mb-2">Recommendations:</div>
                <div className="space-y-1">
                  {item.recommendations.slice(0, 2).map((rec, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs">
                      <span>{getRecommendationIcon(rec.type)}</span>
                      <span className="text-gray-700">{rec.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          No items match the selected filter
        </div>
      )}

      {/* Metadata */}
      {data.metadata && (
        <div className="text-center text-sm text-gray-500">
          Last analyzed: {new Date(data.metadata.analyzedAt).toLocaleString()} • 
          Based on {data.metadata.consumptionLogsAnalyzed} consumption logs ({data.metadata.timeRange})
        </div>
      )}
    </div>
  );
};

export default ExpirationRisk;
