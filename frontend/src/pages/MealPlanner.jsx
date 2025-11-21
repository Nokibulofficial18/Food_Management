import { useState } from 'react';
import { aiAPI } from '../api';

const MealPlanner = () => {
  const [budget, setBudget] = useState(100);
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeDay, setActiveDay] = useState(null);

  const generateMealPlan = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.optimizeMealPlan({ budget });
      setMealPlan(response.data);
      const firstDay = Object.keys(response.data.weeklyMealPlan)[0];
      setActiveDay(firstDay);
    } catch (error) {
      console.error('Failed to generate meal plan:', error);
      alert('Failed to generate meal plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">🤖 AI is Optimizing...</h3>
          <p className="text-gray-600">Analyzing your budget, inventory, and nutrition needs</p>
        </div>
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="glass-card-strong text-center py-12">
          <div className="text-7xl mb-6">🍽️</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Meal Optimizer</h1>
          <p className="text-gray-600 mb-8 text-lg">
            Generate a personalized 7-day meal plan that balances cost, nutrition, and reduces food waste!
          </p>

          <div className="max-w-md mx-auto mb-8">
            <label className="block text-left text-sm font-semibold text-gray-700 mb-3">
              Weekly Budget ($)
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              min="20"
              max="500"
              className="input-field text-center text-2xl font-bold"
            />
            <div className="mt-2 text-sm text-gray-500">
              Recommended: $50 - $150 per week
            </div>
          </div>

          <button
            onClick={generateMealPlan}
            className="btn-primary text-lg px-8 py-4"
          >
            🚀 Generate Meal Plan
          </button>

          <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">✅</div>
              <div className="font-semibold text-gray-900">Budget Optimized</div>
              <div className="text-gray-600 text-xs">Stay within your budget</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">🥗</div>
              <div className="font-semibold text-gray-900">Nutrition Balanced</div>
              <div className="text-gray-600 text-xs">Meet daily targets</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl mb-2">♻️</div>
              <div className="font-semibold text-gray-900">Waste Reduced</div>
              <div className="text-gray-600 text-xs">Use inventory items</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { weeklyMealPlan, shoppingList, nutritionalSummary, costBreakdown, metadata } = mealPlan;
  const days = Object.keys(weeklyMealPlan);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card-strong">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🍽️ Your Personalized Meal Plan
            </h1>
            <p className="text-gray-600">
              Optimized for ${metadata.totalBudget} weekly budget
            </p>
          </div>
          <button
            onClick={() => setMealPlan(null)}
            className="btn-primary"
          >
            ↻ Generate New Plan
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-2 border-green-200">
            <div className="text-sm text-gray-600 mb-1">Estimated Spend</div>
            <div className="text-3xl font-bold text-green-600">${costBreakdown.total}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-200">
            <div className="text-sm text-gray-600 mb-1">Budget Remaining</div>
            <div className="text-3xl font-bold text-blue-600">${metadata.budgetRemaining.toFixed(2)}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border-2 border-purple-200">
            <div className="text-sm text-gray-600 mb-1">Waste Reduction</div>
            <div className="text-3xl font-bold text-purple-600">{metadata.wasteReduction.reductionPercent}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border-2 border-orange-200">
            <div className="text-sm text-gray-600 mb-1">Avg Daily Calories</div>
            <div className="text-3xl font-bold text-orange-600">{nutritionalSummary.weekly.averages.calories}</div>
          </div>
        </div>
      </div>

      {/* Day Selector */}
      <div className="glass-card-strong">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {days.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                activeDay === day
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Active Day Meals */}
      {activeDay && weeklyMealPlan[activeDay] && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(weeklyMealPlan[activeDay].meals).map(([mealType, meal]) => (
            <div key={mealType} className="glass-card bg-white border-2 border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 capitalize">{mealType}</h3>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                  ${meal.adjustedCost.toFixed(2)}
                </span>
              </div>

              <h4 className="font-bold text-gray-900 mb-2">{meal.name}</h4>

              {/* Nutrition */}
              <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-gray-600">Calories</div>
                  <div className="font-bold text-gray-900">{meal.nutrition.calories}</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-gray-600">Protein</div>
                  <div className="font-bold text-gray-900">{meal.nutrition.protein}g</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-gray-600">Carbs</div>
                  <div className="font-bold text-gray-900">{meal.nutrition.carbs}g</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-gray-600">Fat</div>
                  <div className="font-bold text-gray-900">{meal.nutrition.fat}g</div>
                </div>
              </div>

              {/* Uses Inventory */}
              {meal.usesInventory && meal.usesInventory.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-xs font-semibold text-green-700 mb-2">♻️ Uses Inventory:</div>
                  {meal.usesInventory.map((item, idx) => (
                    <div key={idx} className="text-xs text-green-600">
                      • {item.itemName} (expires in {item.daysUntilExpiration} days)
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Shopping List */}
      <div className="glass-card-strong">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🛒 Shopping List</h2>
          {costBreakdown.totalPotentialSavings > 0 && (
            <div className="px-4 py-2 bg-green-100 border-2 border-green-300 rounded-lg">
              <div className="text-xs text-green-700 font-semibold">Potential Savings</div>
              <div className="text-2xl font-bold text-green-600">${costBreakdown.totalPotentialSavings}</div>
            </div>
          )}
        </div>

        {costBreakdown.budgetOptimizationTip && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <div className="font-bold text-blue-900 mb-1">Budget Optimization Tip</div>
                <div className="text-sm text-blue-700">{costBreakdown.budgetOptimizationTip}</div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {shoppingList.map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border-2 border-gray-200 hover:shadow-lg transition-shadow">
              {/* Item Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-900 capitalize">{item.item}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-600">
                      {item.quantity} {item.unit} × ${item.pricePerUnit}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {item.category}
                    </span>
                  </div>
                  {item.mealsUsedIn && item.mealsUsedIn.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Used in: {item.mealsUsedIn.slice(0, 3).join(', ')}
                      {item.mealsUsedIn.length > 3 && ` +${item.mealsUsedIn.length - 3} more`}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">${item.estimatedCost}</div>
                  {item.potentialSavings > 0 && (
                    <div className="text-xs text-green-600 font-semibold mt-1">
                      Save ${item.potentialSavings}
                    </div>
                  )}
                </div>
              </div>

              {/* Recommended Alternative */}
              {item.recommendedAlternative && (
                <div className="mb-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-xs font-bold text-green-700 mb-1">⭐ BEST ALTERNATIVE</div>
                      <div className="font-semibold text-gray-900 capitalize">{item.recommendedAlternative.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{item.recommendedAlternative.reason}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">${item.recommendedAlternative.totalCost}</div>
                      <div className="text-xs text-green-700 font-semibold">
                        -{item.recommendedAlternative.savingsPercent}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* All Alternatives */}
              {item.alternatives && item.alternatives.length > 0 && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-xs font-semibold text-gray-700 mb-2">💰 More Alternatives:</div>
                  <div className="space-y-2">
                    {item.alternatives.slice(0, 3).map((alt, altIdx) => (
                      <div key={altIdx} className="flex items-center justify-between text-sm bg-blue-50 p-3 rounded-lg hover:bg-blue-100 transition-colors">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 capitalize">{alt.name}</div>
                          <div className="text-xs text-gray-600">
                            {item.quantity} {alt.unit} × ${alt.price}
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div className="text-lg font-bold text-blue-600">${alt.totalCost}</div>
                          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold text-xs">
                            Save ${alt.savingsAmount}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Cost Breakdown */}
        <div className="mt-6 pt-6 border-t-2 border-gray-300">
          <h3 className="text-xl font-bold text-gray-900 mb-4">💵 Cost Breakdown</h3>
          
          {/* Category Costs */}
          <div className="space-y-2 mb-4">
            {costBreakdown.byCategory.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <span className="font-semibold text-gray-900 capitalize">{cat.category}</span>
                  <span className="text-xs text-gray-500">({cat.items} items)</span>
                </div>
                <div className="flex items-center gap-4">
                  {cat.potentialSavings > 0 && (
                    <span className="text-xs text-green-600 font-semibold">
                      -${cat.potentialSavings}
                    </span>
                  )}
                  <span className="text-sm text-gray-600">{cat.percentage}</span>
                  <span className="font-bold text-gray-900 w-20 text-right">${cat.cost}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg font-semibold text-gray-900">
              <span>Subtotal (Current Prices)</span>
              <span>${costBreakdown.total}</span>
            </div>
            {costBreakdown.totalPotentialSavings > 0 && (
              <>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg font-semibold text-green-700">
                  <span>Potential Savings</span>
                  <span>-${costBreakdown.totalPotentialSavings}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white font-bold text-lg">
                  <span>Optimized Total</span>
                  <span>${costBreakdown.optimizedTotal}</span>
                </div>
              </>
            )}
            {!costBreakdown.totalPotentialSavings && (
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white font-bold text-lg">
                <span>Total</span>
                <span>${costBreakdown.total}</span>
              </div>
            )}
          </div>

          {/* Budget Status */}
          <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900">Budget Remaining</span>
              <span className="text-2xl font-bold text-blue-600">
                ${metadata.budgetRemaining.toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                style={{ width: `${((costBreakdown.optimizedTotal || costBreakdown.total) / metadata.totalBudget) * 100}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
              <span>Budget: ${metadata.totalBudget}</span>
              <span>Spent: ${(costBreakdown.optimizedTotal || costBreakdown.total).toFixed(2)}</span>
            </div>
          </div>

          {/* Top Savings Opportunities */}
          {costBreakdown.savingsOpportunities && costBreakdown.savingsOpportunities.length > 0 && (
            <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <h4 className="font-bold text-yellow-900 mb-3">🎯 Top Savings Opportunities</h4>
              <div className="space-y-2">
                {costBreakdown.savingsOpportunities.map((opp, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        opp.priority === 'high' ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'
                      }`}>
                        {opp.priority}
                      </span>
                      <span className="text-gray-900 capitalize">{opp.item}</span>
                      <span className="text-gray-500">→</span>
                      <span className="text-gray-700 capitalize">{opp.alternativeName}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">Save ${opp.savings.toFixed(2)}</div>
                      <div className="text-xs text-gray-600">{opp.savingsPercent}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nutritional Summary */}
      <div className="glass-card-strong">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Nutritional Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
            <h3 className="font-bold text-purple-700 mb-4">Weekly Averages</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Calories</span>
                <span className="text-2xl font-bold text-purple-600">
                  {nutritionalSummary.weekly.averages.calories}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Protein</span>
                <span className="text-2xl font-bold text-purple-600">
                  {nutritionalSummary.weekly.averages.protein}g
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Carbs</span>
                <span className="text-2xl font-bold text-purple-600">
                  {nutritionalSummary.weekly.averages.carbs}g
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Fat</span>
                <span className="text-2xl font-bold text-purple-600">
                  {nutritionalSummary.weekly.averages.fat}g
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border-2 border-blue-200">
            <h3 className="font-bold text-blue-700 mb-4">Daily Targets</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700">Calories</span>
                  <span className="font-semibold text-gray-900">
                    {nutritionalSummary.nutritionTargets.calories.optimal}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  Range: {nutritionalSummary.nutritionTargets.calories.min} - {nutritionalSummary.nutritionTargets.calories.max}
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700">Protein</span>
                  <span className="font-semibold text-gray-900">
                    {nutritionalSummary.nutritionTargets.protein.optimal}g
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  Min: {nutritionalSummary.nutritionTargets.protein.min}g
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700">Carbs</span>
                  <span className="font-semibold text-gray-900">
                    {nutritionalSummary.nutritionTargets.carbs.optimal}g
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  Range: {nutritionalSummary.nutritionTargets.carbs.min}g - {nutritionalSummary.nutritionTargets.carbs.max}g
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700">Fat</span>
                  <span className="font-semibold text-gray-900">
                    {nutritionalSummary.nutritionTargets.fat.optimal}g
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  Range: {nutritionalSummary.nutritionTargets.fat.min}g - {nutritionalSummary.nutritionTargets.fat.max}g
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPlanner;
