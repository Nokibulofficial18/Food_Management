# Expiration Risk Prediction Module

## Overview
AI-powered spoilage prevention system that analyzes inventory items and predicts expiration risk using a sophisticated multi-factor algorithm.

## Features

### 🎯 Risk Scoring Algorithm (0-100)
The system calculates risk scores based on 5 key factors:

1. **Expiration Date Proximity** (0-40 points)
   - Days until expiration
   - Expired items receive maximum points
   - Graduated scoring for urgency

2. **Perishability** (0-25 points)
   - Category-specific perishability ratings
   - Based on typical shelf life
   - 8 food categories profiled

3. **Seasonal Effects** (0-15 points)
   - Temperature impact on spoilage
   - Summer months: 1.15-1.3x multiplier
   - Winter months: 0.85-0.9x multiplier
   - Peak summer (June-August): highest risk

4. **Consumption Frequency** (0-20 points)
   - Analyzed from 90-day consumption history
   - Low usage = higher risk
   - Inverse relationship with frequency

5. **Quantity Bonus** (0-10 points)
   - Large quantities increase risk
   - Threshold-based scoring

### 📊 Category Profiles

```javascript
{
  vegetable: { typicalShelfLife: 7, perishability: 0.9 },
  fruit: { typicalShelfLife: 7, perishability: 0.85 },
  protein: { typicalShelfLife: 5, perishability: 0.95 },
  dairy: { typicalShelfLife: 10, perishability: 0.8 },
  grain: { typicalShelfLife: 60, perishability: 0.3 },
  beverage: { typicalShelfLife: 30, perishability: 0.4 },
  snack: { typicalShelfLife: 90, perishability: 0.2 },
  other: { typicalShelfLife: 30, perishability: 0.5 }
}
```

### 🚨 Risk Levels

| Level | Score Range | Priority | Color | Icon |
|-------|-------------|----------|-------|------|
| Critical | 80-100 | 1 | Red | 🚨 |
| High | 60-79 | 2 | Orange | ⚠️ |
| Medium | 40-59 | 3 | Yellow | ⚡ |
| Low | 20-39 | 4 | Blue | ✅ |
| Minimal | 0-19 | 5 | Green | 🟢 |

### 💡 Recommendation System

6 action types with context-aware messages:

1. **Discard** - For expired items
2. **Consume** - For items expiring within 1-3 days
3. **Cook** - For perishables with medium timeframe
4. **Plan** - For items with some time left
5. **Preserve** - For items that can be frozen/preserved
6. **Share** - For excess quantities

## API Endpoint

### GET `/api/ai/exp-risk`

**Authentication:** Required (JWT)

**Response:**
```json
{
  "prioritizedInventory": [
    {
      "id": "...",
      "itemName": "Milk",
      "category": "dairy",
      "quantity": 2,
      "riskScore": 85,
      "riskLevel": "critical",
      "riskColor": "#DC2626",
      "priority": 1,
      "alert": "Critical: Act immediately! This item is at high risk.",
      "icon": "🚨",
      "daysUntilExpiration": 1,
      "isExpired": false,
      "consumptionFrequency": 3.2,
      "riskBreakdown": {
        "expiration": 38,
        "perishability": 20,
        "seasonal": 12,
        "consumption": 8,
        "quantityBonus": 7,
        "description": "..."
      },
      "recommendations": [
        {
          "type": "consume",
          "message": "Consume within 24 hours",
          "priority": "urgent"
        }
      ],
      "topRecommendation": { ... }
    }
  ],
  "alerts": [
    {
      "itemId": "...",
      "itemName": "Milk",
      "category": "dairy",
      "riskScore": 85,
      "riskLevel": "critical",
      "alert": "Critical: Act immediately!",
      "icon": "🚨",
      "daysUntilExpiration": 1,
      "action": "Consume within 24 hours"
    }
  ],
  "summary": {
    "totalItems": 25,
    "criticalItems": 3,
    "highRiskItems": 5,
    "mediumRiskItems": 8,
    "lowRiskItems": 6,
    "minimalRiskItems": 3,
    "expiredItems": 0,
    "averageRiskScore": 42,
    "itemsExpiringSoon": 8
  },
  "categoryRisk": [
    {
      "category": "dairy",
      "totalItems": 5,
      "averageRisk": 68,
      "highRiskCount": 3
    }
  ],
  "seasonalInsight": {
    "season": "summer",
    "message": "Warm weather increases spoilage risk...",
    "affectedCategories": ["fruit", "vegetable", "protein", "dairy"],
    "recommendation": "Consider refrigerating items..."
  },
  "metadata": {
    "analyzedAt": "2024-01-15T10:30:00Z",
    "consumptionLogsAnalyzed": 134,
    "timeRange": "90 days"
  }
}
```

## Frontend Features

### 📱 ExpirationRisk Page (`/expiration-risk`)

**Components:**

1. **Summary Cards**
   - Total items count
   - Critical/High/Medium/Low/Minimal risk counts
   - Color-coded visualization

2. **Urgent Alerts Section**
   - Top 5 highest-risk items
   - Action-oriented messages
   - Expiration countdown

3. **Category Risk Breakdown**
   - Visual progress bars
   - Average risk per category
   - High-risk item count per category

4. **Seasonal Insight Banner**
   - Season-specific warnings
   - Affected categories
   - Temperature-based recommendations

5. **Inventory Grid/List View**
   - Toggle between grid and list
   - Filter by risk level
   - Detailed item cards with:
     - Risk score and badge
     - Days until expiration
     - Consumption frequency
     - Risk factor breakdown
     - Top recommendations

6. **Interactive Filters**
   - All / Critical / High / Medium / Low / Minimal
   - Real-time filtering
   - Item count updates

### 🎨 Visual Design

- **Color Coding:**
  - Critical: Red (#DC2626)
  - High: Orange (#EA580C)
  - Medium: Yellow (#CA8A04)
  - Low: Blue (#2563EB)
  - Minimal: Green (#16A34A)

- **Icons:**
  - Risk level indicators (🚨, ⚠️, ⚡, ✅, 🟢)
  - Recommendation types (🗑️, 🍽️, 👨‍🍳, 📋, 🧊, 🤝)
  - Seasonal indicators (☀️, ❄️)

## Usage Example

### Backend Integration
```javascript
import { 
  calculateRiskScore, 
  getRiskLevel, 
  generateRecommendations 
} from '../services/expirationRiskService.js';

// Calculate risk for an item
const item = { /* inventory item */ };
const consumptionLogs = [ /* user's logs */ ];

const riskData = calculateRiskScore(item, consumptionLogs);
const level = getRiskLevel(riskData.riskScore);
const recommendations = generateRecommendations(item, riskData);
```

### Frontend Integration
```javascript
import { aiAPI } from '../api';

const fetchRisk = async () => {
  const response = await aiAPI.getExpirationRisk();
  // Process response.data
};
```

## Benefits

1. **Proactive Waste Prevention**
   - Identifies at-risk items before spoilage
   - Prioritizes consumption order

2. **Data-Driven Decisions**
   - Uses historical consumption patterns
   - Considers environmental factors

3. **Actionable Insights**
   - Specific recommendations for each item
   - Context-aware suggestions

4. **User-Friendly**
   - Visual risk indicators
   - Clear priority sorting
   - Mobile-responsive design

5. **Seasonal Awareness**
   - Adjusts for temperature effects
   - Provides timely warnings

## Files Created/Modified

### Backend
- ✅ `backend/services/expirationRiskService.js` (NEW)
- ✅ `backend/controllers/aiController.js` (MODIFIED)
- ✅ `backend/routes/aiRoutes.js` (MODIFIED)

### Frontend
- ✅ `frontend/src/pages/ExpirationRisk.jsx` (NEW)
- ✅ `frontend/src/api/index.js` (MODIFIED)
- ✅ `frontend/src/App.jsx` (MODIFIED)
- ✅ `frontend/src/components/Navbar.jsx` (MODIFIED)

## Technical Details

### Dependencies
- MongoDB/Mongoose (data storage)
- Express (API routing)
- React (frontend)
- Tailwind CSS (styling)

### Performance
- Analyzes 90 days of consumption history
- Real-time risk calculation
- Efficient sorting algorithms
- Optimized for large inventories

### Scalability
- Service-based architecture
- Stateless calculations
- Can handle hundreds of items
- Async/await pattern

## Future Enhancements

1. **Machine Learning Integration**
   - Train on user behavior
   - Personalized risk thresholds
   - Predictive consumption patterns

2. **Push Notifications**
   - Daily risk alerts
   - Critical item warnings
   - Smart reminders

3. **Historical Analytics**
   - Waste trends over time
   - Seasonal comparisons
   - Category performance

4. **Integration Features**
   - Calendar integration for meal planning
   - Shopping list generation from high-risk items
   - Recipe suggestions for expiring items

5. **Advanced Factors**
   - Storage location (fridge, pantry, freezer)
   - Household size impact
   - Price-based priority (expensive items first)

## Testing Recommendations

1. Test with various expiration dates (past, near, far)
2. Test with different consumption frequencies (0-10x/week)
3. Test seasonal multipliers (all months)
4. Test category profiles (all 8 categories)
5. Test edge cases (empty inventory, single item, 100+ items)
6. Test filtering and sorting
7. Test mobile responsiveness

---

**Status:** ✅ Complete and Ready for Production

**Last Updated:** January 2024
