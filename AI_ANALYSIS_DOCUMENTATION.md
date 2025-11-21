# 🤖 AI Consumption Pattern Analyzer

## Overview
Advanced AI-powered consumption pattern analysis system that detects consumption anomalies and predicts food waste risk using machine learning algorithms and statistical analysis.

---

## 📁 File Structure

```
backend/
├── controllers/
│   └── analysisController.js     ✅ NEW - AI analysis logic
├── routes/
│   └── analysisRoutes.js         ✅ NEW - Analysis endpoints
└── server.js                     ✅ UPDATED - Added analysis routes

frontend/
├── src/
│   ├── pages/
│   │   └── Analysis.jsx          ✅ NEW - AI analysis UI
│   ├── api/
│   │   └── index.js              ✅ UPDATED - Added analysisAPI
│   ├── components/
│   │   └── Navbar.jsx            ✅ UPDATED - Added AI Analysis link
│   └── App.jsx                   ✅ UPDATED - Added /analysis route
```

---

## 🔌 Backend API Endpoints

### 1. Weekly Analysis
**Endpoint:** `GET /api/analysis/weekly`  
**Auth:** Required (JWT)  
**Description:** Complete AI-powered consumption pattern analysis

**Response:**
```json
{
  "weeklyTrends": {
    "Monday": { "count": 5, "quantity": 12.5 },
    "Tuesday": { "count": 3, "quantity": 8.2 },
    ...
  },
  "categoryTotals": {
    "fruit": 45.2,
    "vegetable": 32.1,
    "protein": 28.5,
    ...
  },
  "flags": {
    "overConsumption": [
      {
        "category": "snack",
        "total": 52.3,
        "average": 35.2,
        "percentage": "148.6"
      }
    ],
    "underConsumption": [
      {
        "category": "vegetable",
        "total": 18.5,
        "average": 35.2,
        "percentage": "52.6"
      }
    ]
  },
  "wastePrediction": [
    {
      "itemId": "507f1f77bcf86cd799439011",
      "itemName": "Milk",
      "category": "dairy",
      "quantity": 2,
      "daysUntilExpiration": 2,
      "expirationDate": "2025-11-23T00:00:00.000Z",
      "riskScore": 70,
      "reasons": [
        "Low usage frequency with near expiration",
        "Expires in 2 day(s)"
      ],
      "recommendation": "HIGH PRIORITY: Plan to use within next meal or freeze"
    }
  ],
  "summary": {
    "totalLogs": 42,
    "totalCategories": 6,
    "totalInventoryItems": 15,
    "highRiskItems": 3,
    "analyzedAt": "2025-11-21T12:34:56.789Z"
  }
}
```

### 2. Consumption Trends
**Endpoint:** `GET /api/analysis/trends?days=30`  
**Auth:** Required (JWT)  
**Query Parameters:**
- `days` (optional, default: 30) - Number of days to analyze

**Response:**
```json
{
  "trends": [
    {
      "_id": {
        "date": "2025-11-15",
        "category": "fruit"
      },
      "totalQuantity": 12.5,
      "count": 3
    }
  ],
  "period": "30 days",
  "startDate": "2025-10-22T00:00:00.000Z",
  "endDate": "2025-11-21T12:34:56.789Z"
}
```

### 3. Category Statistics
**Endpoint:** `GET /api/analysis/category-stats`  
**Auth:** Required (JWT)

**Response:**
```json
{
  "stats": [
    {
      "_id": "fruit",
      "totalQuantity": 45.2,
      "count": 12,
      "averageQuantity": 3.77
    }
  ],
  "totalCategories": 6
}
```

---

## 🧠 AI Algorithm Details

### 1. Weekly Trends Analysis
- Groups consumption logs by day of week (Sunday - Saturday)
- Calculates total count and quantity per day
- Identifies consumption patterns across the week

### 2. Category Analysis
- Aggregates consumption by category (fruit, vegetable, dairy, etc.)
- Computes total consumption per category
- Tracks frequency for waste prediction

### 3. Over/Under Consumption Detection

**Over-Consumption:**
- Category consumption > 130% of average
- Flags potential overconsumption issues
- Example: If avg = 35 units, over = >45.5 units

**Under-Consumption:**
- Category consumption < 60% of average
- Identifies underutilized categories
- Example: If avg = 35 units, under = <21 units

### 4. Waste Risk Prediction Algorithm

**Risk Score Calculation:**

| Factor | Condition | Points | Description |
|--------|-----------|--------|-------------|
| Low Frequency + Expiring | Freq < 70% avg AND expires ≤7 days | +50 | Low usage with near expiration |
| Under-Consumed Category | Category flagged as under-consumed | +20 | Historically unused category |
| Already Expired | Days < 0 | +80 | Item is expired |
| Expires Soon | 0 ≤ days ≤ 3 | +30 | Expires within 3 days |
| Large Quantity + Low Use | Quantity > 5 AND frequency < 3 | +15 | Too much with low consumption |

**Risk Levels:**
- 🔴 **CRITICAL (80+):** Urgent action required
- 🟠 **HIGH (50-79):** High priority
- 🟡 **MODERATE (30-49):** Consider using soon
- 🔵 **LOW (15-29):** Monitor and plan

**Recommendations:**
- **CRITICAL:** Consume immediately or discard if expired
- **HIGH:** Plan to use within next meal or freeze
- **MODERATE:** Consider using soon or incorporating into recipes
- **LOW:** Monitor and plan usage within the week

---

## 🎨 Frontend Features

### Analysis Page Components

**1. Overview Tab**
- Summary statistics (4 metric cards)
- Over-consumption alerts (red cards)
- Under-consumption warnings (yellow cards)

**2. Waste Risk Tab**
- Sorted by risk score (highest first)
- Color-coded risk badges
- Visual risk score bars
- Detailed risk factors
- AI recommendations

**3. Weekly Trends Tab**
- 7 day cards (Sunday - Saturday)
- Meal count and quantity per day
- Visual progress bars

**4. Categories Tab**
- Category breakdown with emojis
- Total consumption per category
- Percentage distribution
- Visual progress bars

### UI Design
- Glassmorphic cards with backdrop blur
- Gradient backgrounds
- Responsive grid layouts
- Smooth transitions and animations
- Color-coded risk indicators
- Interactive tabs

---

## 🚀 Usage Instructions

### Backend Setup
```bash
cd backend
npm install
node server.js
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Access the Analysis
1. Login to the application
2. Click "🤖 AI Analysis" in the navigation bar
3. View comprehensive consumption insights

---

## 📊 Sample Data Flow

1. **User consumes food** → Logs in Consumption Logs
2. **User adds inventory** → Stored in Inventory Items
3. **User visits Analysis page** → Frontend calls `/api/analysis/weekly`
4. **Backend processes:**
   - Fetches all user's consumption logs
   - Fetches current inventory items
   - Runs AI algorithms
   - Calculates trends, flags, and predictions
5. **Frontend displays:**
   - Interactive charts and cards
   - Risk predictions with recommendations
   - Actionable insights

---

## 🔧 Advanced Features

### Optimized MongoDB Queries
- Uses MongoDB aggregation pipelines
- Efficient date filtering
- Grouped calculations
- Sorted results

### Error Handling
- Graceful fallbacks for empty data
- User-friendly error messages
- Default responses when no logs exist

### Scalability
- Supports large datasets
- Efficient algorithms (O(n) complexity)
- Minimal database queries

---

## 📈 Future Enhancements

- [ ] Machine learning predictions using historical data
- [ ] Personalized recommendations based on dietary preferences
- [ ] Export analysis reports (PDF/CSV)
- [ ] Email alerts for high-risk items
- [ ] Integration with recipe suggestions
- [ ] Mobile app with push notifications
- [ ] Community benchmarking (compare with similar users)

---

## 🎯 Round-2 Specification Compliance

✅ **Input:** userId from auth middleware  
✅ **Fetch:** All consumption logs for user  
✅ **Group:** Logs by weekday → weeklyTrends  
✅ **Compute:** Total consumption per category → categoryTotals  
✅ **Detect:** Over (>130%) and Under (<60%) consumption  
✅ **Predict:** Waste risk with scoring algorithm  
✅ **Route:** GET /api/analysis/weekly  
✅ **Controller:** analyzeConsumption function  
✅ **Optimized:** MongoDB aggregation queries  
✅ **Fallback:** Default handling for empty logs  

---

## 🛠️ Testing

### Manual Testing
```bash
# 1. Get auth token
POST http://localhost:5000/api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

# 2. Call analysis endpoint
GET http://localhost:5000/api/analysis/weekly
Headers: Authorization: Bearer <your-token>

# 3. Test with different query parameters
GET http://localhost:5000/api/analysis/trends?days=7
GET http://localhost:5000/api/analysis/category-stats
```

### Expected Behavior
- **With data:** Returns comprehensive analysis
- **Without data:** Returns friendly message with call-to-action
- **Invalid token:** Returns 401 Unauthorized
- **Server error:** Returns 500 with error message

---

## 📝 Notes

- All endpoints require JWT authentication
- Risk scores are calculated in real-time
- Analysis refreshes on each request (no caching)
- Suitable for production use with proper error handling
- Fully integrated with existing models and routes

---

## 👨‍💻 Developer

This AI Consumption Pattern Analyzer was built to seamlessly integrate with the existing FoodSaver application architecture, following best practices and Round-2 specifications.

**Tech Stack:**
- Node.js + Express
- MongoDB + Mongoose
- React + Tailwind CSS
- JWT Authentication

**Contact:** See project repository for more details.
