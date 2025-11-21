import { useState, useEffect } from 'react';
import { analysisAPI } from '../api';

const Analysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    try {
      const response = await analysisAPI.getWeeklyAnalysis();
      setAnalysis(response.data);
    } catch (error) {
      console.error('Failed to load analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 50) return 'bg-orange-500';
    if (score >= 30) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getRiskBadge = (score) => {
    if (score >= 80) return { text: 'CRITICAL', color: 'bg-red-100 text-red-800 border-red-300' };
    if (score >= 50) return { text: 'HIGH', color: 'bg-orange-100 text-orange-800 border-orange-300' };
    if (score >= 30) return { text: 'MODERATE', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    return { text: 'LOW', color: 'bg-blue-100 text-blue-800 border-blue-300' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your consumption patterns...</p>
        </div>
      </div>
    );
  }

  if (!analysis || analysis.message) {
    return (
      <div className="glass-card max-w-2xl mx-auto text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data Available Yet</h2>
        <p className="text-gray-600 mb-6">
          {analysis?.message || 'Start logging your meals to see AI-powered insights!'}
        </p>
        <a href="/logs" className="btn-primary inline-block">
          Start Logging Meals
        </a>
      </div>
    );
  }

  const { weeklyTrends, categoryTotals, flags, wastePrediction, heatmapData, summary } = analysis;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card-strong">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🤖 AI Consumption Pattern Analysis
            </h1>
            <p className="text-gray-600">
              Smart insights based on {summary.totalLogs} consumption logs
            </p>
          </div>
          <button
            onClick={loadAnalysis}
            className="btn-primary"
          >
            🔄 Refresh Analysis
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-200">
            <div className="text-3xl font-bold text-blue-600">{summary.totalLogs}</div>
            <div className="text-sm text-gray-600">Total Logs</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-2 border-green-200">
            <div className="text-3xl font-bold text-green-600">{summary.totalCategories}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border-2 border-purple-200">
            <div className="text-3xl font-bold text-purple-600">{summary.totalInventoryItems}</div>
            <div className="text-sm text-gray-600">Inventory Items</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border-2 border-red-200">
            <div className="text-3xl font-bold text-red-600">{summary.highRiskItems}</div>
            <div className="text-sm text-gray-600">High Risk Items</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border-2 border-orange-200">
            <div className="text-3xl font-bold text-orange-600">{summary.imbalancedCategories || 0}</div>
            <div className="text-sm text-gray-600">Imbalanced Patterns</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card-strong">
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          {['overview', 'imbalanced', 'heatmap', 'waste-risk', 'trends', 'categories'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'border-b-4 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Consumption Flags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Over Consumption */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl border-2 border-red-200">
                <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
                  ⚠️ Over-Consumption ({flags.overConsumption.length})
                </h3>
                {flags.overConsumption.length > 0 ? (
                  <div className="space-y-3">
                    {flags.overConsumption.map((item, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900 capitalize">{item.category}</span>
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                            {item.percentage}%
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Total: {item.total.toFixed(1)} units (Avg: {item.average.toFixed(1)})
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">✅ No over-consumption detected</p>
                )}
              </div>

              {/* Under Consumption */}
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl border-2 border-yellow-200">
                <h3 className="text-xl font-bold text-yellow-700 mb-4 flex items-center gap-2">
                  📉 Under-Consumption ({flags.underConsumption.length})
                </h3>
                {flags.underConsumption.length > 0 ? (
                  <div className="space-y-3">
                    {flags.underConsumption.map((item, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900 capitalize">{item.category}</span>
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold">
                            {item.percentage}%
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Total: {item.total.toFixed(1)} units (Avg: {item.average.toFixed(1)})
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">✅ No under-consumption detected</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Imbalanced Patterns Tab */}
        {activeTab === 'imbalanced' && (
          <div className="space-y-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                ⚖️ Dietary Balance Analysis
              </h3>
              <p className="text-gray-600">
                Nutritional imbalances detected in your consumption patterns
              </p>
            </div>

            {flags.imbalancedPatterns && flags.imbalancedPatterns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {flags.imbalancedPatterns.map((pattern, idx) => {
                  const isCritical = pattern.severity === 'critical';
                  return (
                    <div 
                      key={idx} 
                      className={`p-6 rounded-xl border-2 ${
                        isCritical 
                          ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-300' 
                          : 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                            isCritical ? 'bg-red-200' : 'bg-yellow-200'
                          }`}>
                            {pattern.category === 'vegetable' && '🥕'}
                            {pattern.category === 'fruit' && '🍎'}
                            {pattern.category === 'protein' && '🍗'}
                            {pattern.category === 'dairy' && '🥛'}
                            {pattern.category === 'grain' && '🌾'}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 capitalize text-lg">
                              {pattern.category}
                            </h4>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              isCritical 
                                ? 'bg-red-200 text-red-800' 
                                : 'bg-yellow-200 text-yellow-800'
                            }`}>
                              {pattern.severity.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-600">
                            -{pattern.deficitPercent}%
                          </div>
                          <div className="text-xs text-gray-600">deficit</div>
                        </div>
                      </div>

                      {/* Current vs Target */}
                      <div className="mb-4 p-4 bg-white rounded-lg">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-red-600">{pattern.currentDaily}</div>
                            <div className="text-xs text-gray-600">Current/Day</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-orange-600">{pattern.targetMin}</div>
                            <div className="text-xs text-gray-600">Min Target</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-600">{pattern.targetOptimal}</div>
                            <div className="text-xs text-gray-600">Optimal</div>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-700">Progress to Minimum</span>
                          <span className="text-xs text-gray-600">
                            {((parseFloat(pattern.currentDaily) / pattern.targetMin) * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full ${
                              isCritical ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-gradient-to-r from-yellow-400 to-orange-500'
                            } transition-all duration-500`}
                            style={{ width: `${Math.min((parseFloat(pattern.currentDaily) / pattern.targetMin) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Recommendation */}
                      <div className={`p-3 rounded-lg border-2 ${
                        isCritical 
                          ? 'bg-red-100 border-red-300' 
                          : 'bg-yellow-100 border-yellow-300'
                      }`}>
                        <p className="text-sm font-semibold text-gray-900">
                          💡 {pattern.recommendation}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-green-50 rounded-xl border-2 border-green-200">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-green-700 mb-2">Balanced Diet Detected!</h3>
                <p className="text-gray-600">Your nutritional intake is well-balanced across all categories.</p>
              </div>
            )}
          </div>
        )}

        {/* Heatmap Tab */}
        {activeTab === 'heatmap' && (
          <div className="space-y-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                🔥 Consumption Heatmap
              </h3>
              <p className="text-gray-600">
                Visual intensity map of your eating patterns across days and categories
              </p>
            </div>

            {heatmapData && heatmapData.matrix ? (
              <div>
                {/* Heatmap Matrix */}
                <div className="bg-white p-6 rounded-xl border-2 border-gray-200 overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-2 text-left font-bold text-gray-700">Day \ Category</th>
                        {heatmapData.metadata.categories.map(category => (
                          <th key={category} className="p-2 text-center font-bold text-gray-700 capitalize text-sm">
                            {category === 'vegetable' && '🥕'}
                            {category === 'fruit' && '🍎'}
                            {category === 'protein' && '🍗'}
                            {category === 'dairy' && '🥛'}
                            {category === 'grain' && '🌾'}
                            {category === 'beverage' && '🥤'}
                            {category === 'snack' && '🍪'}
                            <br />
                            <span className="text-xs">{category}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {heatmapData.metadata.weekdays.map(day => (
                        <tr key={day} className="border-t border-gray-200">
                          <td className="p-2 font-semibold text-gray-900">{day}</td>
                          {heatmapData.metadata.categories.map(category => {
                            const cell = heatmapData.matrix[day][category];
                            const getHeatColor = (level) => {
                              switch(level) {
                                case 'none': return 'bg-gray-100 text-gray-400';
                                case 'low': return 'bg-blue-100 text-blue-700';
                                case 'moderate': return 'bg-yellow-100 text-yellow-800';
                                case 'high': return 'bg-orange-200 text-orange-900';
                                case 'very-high': return 'bg-red-300 text-red-900';
                                default: return 'bg-gray-100 text-gray-400';
                              }
                            };
                            
                            return (
                              <td key={category} className="p-1">
                                <div 
                                  className={`w-full h-16 flex flex-col items-center justify-center rounded-lg transition-all hover:scale-110 cursor-pointer ${
                                    getHeatColor(cell.level)
                                  }`}
                                  title={`${day} - ${category}: ${cell.value} servings (${cell.intensity}% intensity)`}
                                >
                                  <div className="text-lg font-bold">{cell.value}</div>
                                  <div className="text-xs opacity-75">{cell.intensity}%</div>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Legend */}
                  <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
                    <span className="text-sm font-semibold text-gray-700">Intensity:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-6 bg-gray-100 rounded border border-gray-300"></div>
                      <span className="text-xs text-gray-600">None</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-6 bg-blue-100 rounded border border-blue-300"></div>
                      <span className="text-xs text-gray-600">Low</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-6 bg-yellow-100 rounded border border-yellow-300"></div>
                      <span className="text-xs text-gray-600">Moderate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-6 bg-orange-200 rounded border border-orange-400"></div>
                      <span className="text-xs text-gray-600">High</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-6 bg-red-300 rounded border border-red-500"></div>
                      <span className="text-xs text-gray-600">Very High</span>
                    </div>
                  </div>
                </div>

                {/* Heatmap Insights */}
                {heatmapData.insights && heatmapData.insights.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">🧠 Pattern Insights</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {heatmapData.insights.map((insight, idx) => {
                        const severityColors = {
                          critical: 'from-red-50 to-red-100 border-red-300',
                          warning: 'from-yellow-50 to-yellow-100 border-yellow-300',
                          info: 'from-blue-50 to-blue-100 border-blue-300'
                        };
                        const iconMap = {
                          'peak-consumption': '📈',
                          'low-activity': '📉',
                          'category-spike': '⚡',
                          'missing-essential': '⚠️',
                          'weekend-pattern': '🎉',
                          'weekday-pattern': '💼'
                        };
                        
                        return (
                          <div 
                            key={idx} 
                            className={`p-4 rounded-xl border-2 bg-gradient-to-br ${
                              severityColors[insight.severity] || severityColors.info
                            }`}
                          >
                            <div className="flex items-start gap-3 mb-2">
                              <div className="text-2xl">{iconMap[insight.type] || '💡'}</div>
                              <div className="flex-1">
                                <h5 className="font-bold text-gray-900 mb-1">{insight.title}</h5>
                                <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                                <div className="p-2 bg-white/70 rounded-lg">
                                  <p className="text-xs font-semibold text-gray-800">
                                    💡 {insight.recommendation}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-gray-200">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Heatmap Data</h3>
                <p className="text-gray-600">Log more meals throughout the week to see consumption patterns.</p>
              </div>
            )}
          </div>
        )}

        {/* Waste Risk Tab */}
        {activeTab === 'waste-risk' && (
          <div>
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                🎯 Waste Risk Prediction
              </h3>
              <p className="text-gray-600">
                Items sorted by risk score (highest risk first)
              </p>
            </div>

            {wastePrediction.length > 0 ? (
              <div className="space-y-4">
                {wastePrediction.map((item, idx) => {
                  const badge = getRiskBadge(item.riskScore);
                  return (
                    <div key={idx} className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{item.itemName}</h4>
                          <p className="text-sm text-gray-500 capitalize">{item.category} • {item.quantity} units</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
                          {badge.text} RISK
                        </span>
                      </div>

                      {/* Risk Score Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-700">Risk Score</span>
                          <span className="text-sm font-bold text-gray-900">{item.riskScore}/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full ${getRiskColor(item.riskScore)} transition-all duration-500`}
                            style={{ width: `${item.riskScore}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Expiration Info */}
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Expires in:</span>
                          <span className={`font-bold ${
                            item.daysUntilExpiration < 0 ? 'text-red-600' :
                            item.daysUntilExpiration <= 3 ? 'text-orange-600' :
                            'text-gray-900'
                          }`}>
                            {item.daysUntilExpiration < 0 
                              ? 'EXPIRED' 
                              : `${item.daysUntilExpiration} day${item.daysUntilExpiration !== 1 ? 's' : ''}`
                            }
                          </span>
                        </div>
                      </div>

                      {/* Risk Reasons */}
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Risk Factors:</p>
                        <ul className="space-y-1">
                          {item.reasons.map((reason, i) => (
                            <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                              <span className="text-red-500 mt-0.5">•</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Recommendation */}
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-semibold text-blue-900">
                          💡 {item.recommendation}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-green-50 rounded-xl border-2 border-green-200">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-green-700 mb-2">No Waste Risk Detected!</h3>
                <p className="text-gray-600">All your items are being consumed efficiently.</p>
              </div>
            )}
          </div>
        )}

        {/* Weekly Trends Tab */}
        {activeTab === 'trends' && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">📅 Weekly Consumption Trends</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(weeklyTrends).map(([day, data]) => (
                <div key={day} className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border-2 border-purple-200">
                  <h4 className="font-bold text-purple-700 mb-3">{day}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Meals</span>
                      <span className="text-2xl font-bold text-purple-600">{data.count}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Quantity</span>
                      <span className="text-lg font-semibold text-gray-700">{data.quantity.toFixed(1)}</span>
                    </div>
                  </div>
                  {/* Visual indicator */}
                  <div className="mt-3 h-2 bg-purple-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500"
                      style={{ width: `${Math.min((data.count / 10) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">🍽️ Category Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).map(([category, total]) => {
                const percentage = (total / Object.values(categoryTotals).reduce((a, b) => a + b, 0)) * 100;
                return (
                  <div key={category} className="bg-white p-5 rounded-xl border-2 border-gray-200 hover:shadow-lg transition-shadow">
                    <h4 className="font-bold text-gray-900 capitalize mb-3 flex items-center gap-2">
                      {category === 'fruit' && '🍎'}
                      {category === 'vegetable' && '🥕'}
                      {category === 'dairy' && '🥛'}
                      {category === 'grain' && '🌾'}
                      {category === 'protein' && '🍗'}
                      {category === 'beverage' && '🥤'}
                      {category === 'snack' && '🍿'}
                      {category === 'other' && '📦'}
                      {category}
                    </h4>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-blue-600">{total.toFixed(1)}</div>
                      <div className="text-sm text-gray-600">{percentage.toFixed(1)}% of total</div>
                    </div>
                    <div className="mt-3 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analysis;
