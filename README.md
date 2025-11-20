# AI-Powered Food Management & Sustainability Platform

> **Part 1 - Non-AI Base Implementation**  
> A comprehensive MERN stack web application for managing food inventory, tracking consumption, and promoting sustainable food practices.


## 📋 Overview

This platform helps users manage their food inventory, track consumption patterns, reduce food waste, and access sustainability resources. Built with modern web technologies following MVC architecture and best practices.

## Live Link: https://food-manageme-git-2d5440-nokibul-hasan-mojumder-tasirs-projects.vercel.app?_vercel_share=K144m4sPatEhs1eh3AqWIZZygFEYqzRG

## ✨ Features

### 🔐 Authentication & User Management
- User registration with email validation
- Secure login with JWT authentication
- Password hashing with bcrypt
- Protected routes and session management
- User profile management

### 👤 User Profile
- Personal information management
- Household size tracking
- Dietary preferences
- Budget preference settings
- Location information

### 📊 Food Inventory Management
- Add, edit, and delete inventory items
- Track purchase and expiration dates
- Categorize items (fruits, dairy, grains, etc.)
- Visual indicators for expiring items
- Real-time inventory status

### 📝 Consumption Logging
- Log daily food usage
- Track quantity and category
- View consumption history
- Filter by date and category
- Delete past entries

### 🍎 Food Items Database
- Pre-seeded database with 20+ common food items
- Typical expiration days information
- Cost per unit tracking
- Categorized for easy reference

### 📘 Sustainability Resources
- 20+ curated sustainability tips and guides
- Categorized resources (articles, videos, guides)
- Filter by category and type
- Personalized recommendations based on usage patterns

### 📈 Dashboard & Analytics
- Inventory summary statistics
- Recent consumption logs
- Expiring items alerts
- Personalized resource recommendations
- Category-based insights

### 🖼️ Image Upload
- Upload food images
- Link images to inventory items
- Supports JPG, PNG, GIF formats
- 5MB file size limit

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **TailwindCSS** - Utility-first CSS framework
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **express-validator** - Input validation

## 📁 Project Structure

```
bubt innovationx/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── consumptionController.js
│   │   ├── foodController.js
│   │   ├── inventoryController.js
│   │   ├── resourceController.js
│   │   ├── summaryController.js
│   │   ├── uploadController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── upload.js
│   │   └── validation.js
│   ├── models/
│   │   ├── ConsumptionLog.js
│   │   ├── FoodItem.js
│   │   ├── InventoryItem.js
│   │   ├── Resource.js
│   │   ├── Upload.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── consumptionRoutes.js
│   │   ├── foodRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── resourceRoutes.js
│   │   ├── summaryRoutes.js
│   │   ├── uploadRoutes.js
│   │   └── userRoutes.js
│   ├── seed/
│   │   └── seedDatabase.js
│   ├── uploads/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── axios.js
    │   │   └── index.js
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   ├── Navbar.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Inventory.jsx
    │   │   ├── Login.jsx
    │   │   ├── Logs.jsx
    │   │   ├── Profile.jsx
    │   │   ├── Register.jsx
    │   │   └── Resources.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── .env.example
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    └── vite.config.js
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation

#### 1. Clone the repository

```bash
git clone <repository-url>
cd "bubt innovationx"
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env file with your configuration
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/food-management
# JWT_SECRET=your_secret_key_here
# NODE_ENV=development
```

#### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env file
# VITE_API_URL=http://localhost:5000/api
```

### Running the Application

#### 1. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongodb
# or
mongod
```

#### 2. Seed the Database (First time only)

```bash
# From backend directory
cd backend
npm run seed
```

This will populate the database with:
- 20 food items (fruits, vegetables, dairy, etc.)
- 20 sustainability resources (articles, guides, tips)

#### 3. Start Backend Server

```bash
# From backend directory
npm run dev
# or
npm start
```

Server will run on `http://localhost:5000`

#### 4. Start Frontend Development Server

```bash
# From frontend directory (in a new terminal)
cd frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

#### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### User Profile
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)

### Consumption Logs
- `GET /api/consumption` - Get all logs (protected)
- `POST /api/consumption` - Create log (protected)
- `GET /api/consumption/:id` - Get single log (protected)
- `PUT /api/consumption/:id` - Update log (protected)
- `DELETE /api/consumption/:id` - Delete log (protected)

### Inventory
- `GET /api/inventory` - Get all items (protected)
- `POST /api/inventory` - Create item (protected)
- `GET /api/inventory/:id` - Get single item (protected)
- `PUT /api/inventory/:id` - Update item (protected)
- `DELETE /api/inventory/:id` - Delete item (protected)

### Food Items
- `GET /api/food` - Get all food items
- `GET /api/food/:id` - Get single food item

### Resources
- `GET /api/resources` - Get all resources
- `GET /api/resources/:id` - Get single resource

### Uploads
- `POST /api/uploads` - Upload file (protected)
- `GET /api/uploads` - Get user uploads (protected)
- `DELETE /api/uploads/:id` - Delete upload (protected)

### Summary
- `GET /api/summary` - Get dashboard summary (protected)

## 🗄️ Database Models

### User
- fullName, email, password (hashed)
- householdSize, dietaryPreferences, location
- budgetPreference

### ConsumptionLog
- userId, itemName, quantity, category
- date, notes

### InventoryItem
- userId, itemName, category, quantity
- purchaseDate, expirationDate, notes, imageUrl

### FoodItem
- name, category, typicalExpirationDays
- costPerUnit, unit, description

### Resource
- title, description, url
- relatedCategory, type, tags

### Upload
- userId, filename, originalName, path
- mimetype, size, relatedTo, relatedId

## 🎨 UI Features

- Responsive design for all screen sizes
- Clean, modern interface with TailwindCSS
- Color-coded status indicators
- Smooth transitions and hover effects
- Form validation and error handling
- Loading states and user feedback
- Protected routes with authentication checks

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Input validation and sanitization
- CORS enabled
- File upload restrictions
- SQL injection prevention (NoSQL)

## 📦 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/food-management
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🧪 Testing the Application

1. **Register a new account**
   - Navigate to `/register`
   - Fill in all required fields
   - Submit the form

2. **Login**
   - Use your registered credentials
   - You'll be redirected to the dashboard

3. **Add inventory items**
   - Go to Inventory page
   - Click "Add Item"
   - Fill in item details with expiration date

4. **Log consumption**
   - Go to Logs page
   - Click "Add Log"
   - Record what you've consumed

5. **View dashboard**
   - See your inventory stats
   - Check recommended resources
   - View recent activity

6. **Upload images**
   - From the dashboard
   - Select an image file
   - Upload and link to items

7. **Browse resources**
   - Visit Resources page
   - Filter by category or type
   - Click links to learn more

## 🚧 Future Enhancements (Part 2 - AI Integration)

- AI-powered food recognition from images
- Smart expiration predictions
- Personalized recipe recommendations
- Waste reduction suggestions
- Shopping list generation
- Nutritional analysis
- Meal planning automation

## 👥 Contributing

This project was created for the BUBT InnovateX Hackathon.

## 📄 License

This project is part of the BUBT InnovateX Hackathon submission.

## 🙏 Acknowledgments

- BUBT InnovateX Hackathon organizers
- Food sustainability resources and research
- Open-source community


