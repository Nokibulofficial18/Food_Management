import { useState, useEffect } from 'react';
import { aiAPI } from '../api';

const WasteEstimate = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [view, setView] = useState('overview'); // 'overview', 'categories', 'recommendations'

  useEffect(() => {
    fetchWasteEstimate();
  }, []);

  const fetchWasteEstimate = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await aiAPI.getWasteEstimate();
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load waste estimation');
      console.error('Error fetching waste estimate:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (rating) => {
    const colors = {
      'excellent': 'text-green-600',
      'good': 'text-blue-600',
      'average': 'text-yellow-600',
      'below-average': 'text-orange-600',
      'needs-improvement': 'text-red-600'
    };
    return colors[rating] || 'text-gray-600';
  };

  const getPerformanceBg = (rating) => {
    const colors = {
      'excellent': 'bg-green-50 border-green-300',
      'good': 'bg-blue-50 border-blue-300',
      'average': 'bg-yellow-50 border-yellow-300',
      'below-average': 'bg-orange-50 border-orange-300',
      'needs-improvement': 'bg-red-50 border-red-300'
    };
    return colors[rating] || 'bg-gray-50 border-gray-300';
  };

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
          onClick={fetchWasteEstimate}
          className="mt-2 text-red-600 hover:text-red-800 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data || (data.weeklyWaste.grams === 0 && data.monthlyWaste.grams === 0)) {
    return (
      <div className="bg-green-50 rounded-lg p-8 text-center">
        <span className="text-6xl mb-4 block">🌟</span>
        <p className="text-green-800 text-xl font-semibold">Zero Waste Detected!</p>
        <p className="text-green-700 mt-2">Keep up the excellent work managing your inventory!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Waste Estimation</h1>
          <p className="text-gray-600 mt-1">Track and reduce your food waste with AI insights</p>
        </div>
        <button
          onClick={fetchWasteEstimate}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
        >
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      {/* Performance Banner */}
      {data.communityComparison && (
        <div className={`p-6 rounded-lg border-2 ${getPerformanceBg(data.communityComparison.performanceRating)}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className={`text-2xl font-bold mb-2 ${getPerformanceColor(data.communityComparison.performanceRating)}`}>
                {data.communityComparison.performanceMessage}
              </h2>
              <div className="flex items-center space-x-4 mt-3">
                <div>
                  <span className="text-sm text-gray-600">Your Ranking:</span>
                  <span className={`ml-2 text-lg font-bold ${getPerformanceColor(data.communityComparison.performanceRating)}`}>
                    Top {100 - data.communityComparison.ranking.percentile}%
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {data.communityComparison.ranking.message}
                </div>
              </div>
            </div>
            <div className="text-6xl">
              {data.communityComparison.performanceRating === 'excellent' ? '🌟' :
               data.communityComparison.performanceRating === 'good' ? '✅' :
               data.communityComparison.performanceRating === 'average' ? '📊' :
               data.communityComparison.performanceRating === 'below-average' ? '⚠️' : '🚨'}
            </div>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Waste */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Weekly Waste</h3>
            <span className="text-2xl">📅</span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <div className="text-sm text-gray-600">Food Waste</div>
                <div className="text-3xl font-bold text-orange-600">{data.weeklyWaste.grams}g</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Money Lost</div>
                <div className="text-3xl font-bold text-red-600">${data.weeklyWaste.money}</div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Items affected:</span>
                <span className="font-semibold">{data.weeklyWaste.itemCount}</span>
              </div>
              {data.insights?.wasteByType && (
                <>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Actual waste:</span>
                    <span className="font-semibold text-red-600">
                      {data.insights.wasteByType.actual.grams}g ({data.insights.wasteByType.actual.percentage}%)
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Predicted waste:</span>
                    <span className="font-semibold text-orange-600">
                      {data.insights.wasteByType.predicted.grams}g ({data.insights.wasteByType.predicted.percentage}%)
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Monthly Waste */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Monthly Waste</h3>
            <span className="text-2xl">📊</span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <div className="text-sm text-gray-600">Food Waste</div>
                <div className="text-3xl font-bold text-orange-600">{data.monthlyWaste.grams}g</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Money Lost</div>
                <div className="text-3xl font-bold text-red-600">${data.monthlyWaste.money}</div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Items affected:</span>
                <span className="font-semibold">{data.monthlyWaste.itemCount}</span>
              </div>
              {data.insights?.yearlyProjection && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg">
                  <div className="text-xs text-red-700 font-semibold mb-1">Yearly Projection</div>
                  <div className="flex justify-between">
                    <span className="text-sm text-red-800">{data.insights.yearlyProjection.grams}g</span>
                    <span className="text-sm text-red-800 font-bold">${data.insights.yearlyProjection.money}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Community Comparison */}
      {data.communityComparison && (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <span>👥</span>
            <span>Community Comparison</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weekly Comparison */}
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-3">Weekly Performance</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="text-xs text-gray-600">Your Waste</div>
                    <div className="font-semibold text-gray-800">{data.communityComparison.weekly.grams.user}g</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-xs text-gray-600">Community Avg</div>
                    <div className="font-semibold text-gray-800">{data.communityComparison.weekly.grams.community}g</div>
                  </div>
                  <div className="flex-1 text-right">
                    <div className={`text-sm font-bold ${
                      data.communityComparison.weekly.grams.performance === 'better' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {data.communityComparison.weekly.grams.percentageDiff > 0 ? '+' : ''}
                      {data.communityComparison.weekly.grams.percentageDiff}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="text-xs text-gray-600">Your Cost</div>
                    <div className="font-semibold text-gray-800">${data.communityComparison.weekly.money.user}</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-xs text-gray-600">Community Avg</div>
                    <div className="font-semibold text-gray-800">${data.communityComparison.weekly.money.community}</div>
                  </div>
                  <div className="flex-1 text-right">
                    <div className={`text-sm font-bold ${
                      data.communityComparison.weekly.money.performance === 'better' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {data.communityComparison.weekly.money.percentageDiff > 0 ? '+' : ''}
                      {data.communityComparison.weekly.money.percentageDiff}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Comparison */}
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-3">Monthly Performance</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="text-xs text-gray-600">Your Waste</div>
                    <div className="font-semibold text-gray-800">{data.communityComparison.monthly.grams.user}g</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-xs text-gray-600">Community Avg</div>
                    <div className="font-semibold text-gray-800">{data.communityComparison.monthly.grams.community}g</div>
                  </div>
                  <div className="flex-1 text-right">
                    <div className={`text-sm font-bold ${
                      data.communityComparison.monthly.grams.performance === 'better' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {data.communityComparison.monthly.grams.percentageDiff > 0 ? '+' : ''}
                      {data.communityComparison.monthly.grams.percentageDiff}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="text-xs text-gray-600">Your Cost</div>
                    <div className="font-semibold text-gray-800">${data.communityComparison.monthly.money.user}</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-xs text-gray-600">Community Avg</div>
                    <div className="font-semibold text-gray-800">${data.communityComparison.monthly.money.community}</div>
                  </div>
                  <div className="flex-1 text-right">
                    <div className={`text-sm font-bold ${
                      data.communityComparison.monthly.money.performance === 'better' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {data.communityComparison.monthly.money.percentageDiff > 0 ? '+' : ''}
                      {data.communityComparison.monthly.money.percentageDiff}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setView('overview')}
          className={`px-4 py-2 font-medium transition ${
            view === 'overview'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setView('categories')}
          className={`px-4 py-2 font-medium transition ${
            view === 'categories'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          By Category
        </button>
        <button
          onClick={() => setView('recommendations')}
          className={`px-4 py-2 font-medium transition ${
            view === 'recommendations'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Recommendations
        </button>
      </div>

      {/* Overview Tab */}
      {view === 'overview' && data.insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border-2 border-orange-300">
            <div className="text-sm text-orange-700 font-semibold mb-2">Daily Average</div>
            <div className="text-2xl font-bold text-orange-800">{data.insights.wastePerDay.grams}g</div>
            <div className="text-lg font-semibold text-orange-700 mt-1">${data.insights.wastePerDay.money}/day</div>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border-2 border-red-300">
            <div className="text-sm text-red-700 font-semibold mb-2">Top Wasted Category</div>
            <div className="text-2xl font-bold text-red-800 capitalize">{data.insights.topWastedCategory}</div>
            <div className="text-sm text-red-600 mt-1">Needs attention</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border-2 border-purple-300">
            <div className="text-sm text-purple-700 font-semibold mb-2">Yearly Impact</div>
            <div className="text-2xl font-bold text-purple-800">{(data.insights.yearlyProjection.grams / 1000).toFixed(1)}kg</div>
            <div className="text-lg font-semibold text-purple-700 mt-1">${data.insights.yearlyProjection.money}/year</div>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {view === 'categories' && data.categoryBreakdown && (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Waste by Category</h3>
          <div className="space-y-4">
            {data.categoryBreakdown.map((category, idx) => (
              <div key={idx} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {category.category === 'vegetable' ? '🥬' :
                       category.category === 'fruit' ? '🍎' :
                       category.category === 'protein' ? '🥩' :
                       category.category === 'dairy' ? '🥛' :
                       category.category === 'grain' ? '🌾' :
                       category.category === 'beverage' ? '🥤' :
                       category.category === 'snack' ? '🍪' : '📦'}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-800 capitalize">{category.category}</div>
                      <div className="text-sm text-gray-600">{category.itemCount} items</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-600">{category.grams}g</div>
                    <div className="text-sm font-semibold text-red-600">${category.money}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-3 relative overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-sm font-semibold text-gray-700 w-12 text-right">
                    {category.percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {view === 'recommendations' && data.recommendations && (
        <div className="space-y-4">
          {data.recommendations.map((rec, idx) => (
            <div 
              key={idx}
              className={`p-5 rounded-lg border-2 ${
                rec.priority === 'high' 
                  ? 'bg-red-50 border-red-300' 
                  : 'bg-yellow-50 border-yellow-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      rec.priority === 'high' 
                        ? 'bg-red-200 text-red-800' 
                        : 'bg-yellow-200 text-yellow-800'
                    }`}>
                      {rec.priority} Priority
                    </span>
                    <span className="text-sm text-gray-600 capitalize">{rec.category}</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 text-lg mb-2">{rec.issue}</h4>
                  <p className="text-gray-700">{rec.suggestion}</p>
                </div>
                <div className="ml-4 text-right">
                  <div className="text-sm text-gray-600">Potential Savings</div>
                  <div className="text-2xl font-bold text-green-600">${rec.potentialSavings.toFixed(2)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Metadata */}
      {data.metadata && (
        <div className="text-center text-sm text-gray-500">
          Last analyzed: {new Date(data.metadata.analyzedAt).toLocaleString()} • 
          {data.metadata.inventoryItemsAnalyzed} inventory items • 
          {data.metadata.consumptionLogsAnalyzed} consumption logs
        </div>
      )}
    </div>
  );
};

export default WasteEstimate;
