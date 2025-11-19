# Quick Start Guide

## Setup Instructions

### 1. Install Dependencies

Open **two** terminal windows:

**Terminal 1 - Backend:**
```powershell
cd backend
npm install
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm install
```

### 2. Start MongoDB

Make sure MongoDB is installed and running. In a PowerShell terminal:
```powershell
net start MongoDB
```

Or if you installed MongoDB manually:
```powershell
mongod
```

### 3. Seed the Database

In the backend terminal:
```powershell
npm run seed
```

You should see:
- ✅ Connected to MongoDB
- 🗑️ Cleared existing data
- ✅ Inserted 20 food items
- ✅ Inserted 20 resources
- 🎉 Database seeded successfully!

### 4. Start the Backend Server

In the backend terminal:
```powershell
npm run dev
```

You should see:
- ✅ MongoDB connected successfully
- 🚀 Server running on port 5000

### 5. Start the Frontend Server

In the frontend terminal:
```powershell
npm run dev
```

You should see:
- VITE ready in X ms
- Local: http://localhost:3000

### 6. Access the Application

Open your browser and go to:
```
http://localhost:3000
```

### 7. Create Your First Account

1. Click "Sign up" or navigate to `/register`
2. Fill in:
   - Full Name: Your Name
   - Email: your.email@example.com
   - Password: (minimum 6 characters)
   - Household Size: 1 (or your household size)
   - Location: Your City, Country

3. Click "Sign Up"
4. You'll be automatically logged in and redirected to the dashboard

### 8. Explore the Features

#### Add Inventory Items
1. Click "Inventory" in the navigation
2. Click "Add Item"
3. Fill in:
   - Item Name: e.g., "Milk"
   - Category: "Dairy"
   - Quantity: 1
   - Expiration Date: Pick a date 7 days from now
4. Click "Add Item"

#### Log Food Consumption
1. Click "Logs" in the navigation
2. Click "Add Log"
3. Fill in:
   - Item Name: e.g., "Apple"
   - Quantity: 2
   - Category: "Fruit"
   - Notes: Optional notes
4. Click "Add Log"

#### View Dashboard
- See your inventory statistics
- View recent consumption logs
- Get personalized resource recommendations
- Upload images

#### Browse Resources
1. Click "Resources" in the navigation
2. Filter by category or type
3. Click on resources to learn more

#### Update Profile
1. Click "Profile" in the navigation
2. Update your information
3. Add dietary preferences (comma-separated)
4. Set your monthly budget preference
5. Click "Save Changes"

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `net start MongoDB`
- Check if MongoDB is installed correctly
- Verify MONGODB_URI in backend/.env

### Port Already in Use
- Backend (5000): Stop any process using port 5000
- Frontend (3000): Change port in vite.config.js

### Module Not Found
- Delete node_modules and package-lock.json
- Run `npm install` again

### CORS Errors
- Ensure backend is running on port 5000
- Ensure frontend is running on port 3000
- Check VITE_API_URL in frontend/.env

### Token/Authentication Issues
- Clear browser localStorage
- Log out and log in again
- Check JWT_SECRET in backend/.env

## Default Test Data

After seeding, you'll have access to:
- **20 Food Items**: Apples, Bananas, Milk, Cheese, Chicken, Rice, etc.
- **20 Resources**: Articles, guides, and tips on food sustainability

## API Testing (Optional)

You can test the API endpoints using tools like Postman or Thunder Client:

### Register User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "fullName": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "householdSize": 2
}
```

### Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

Copy the token from the response and use it in subsequent requests:

### Get Summary (Protected)
```
GET http://localhost:5000/api/summary
Authorization: Bearer YOUR_TOKEN_HERE
```

## Development Tips

- Backend auto-restarts with nodemon on file changes
- Frontend hot-reloads with Vite
- Check browser console for frontend errors
- Check terminal for backend errors
- Use React DevTools for component debugging

## Next Steps

Once you're comfortable with the base application:
1. Customize the UI colors in tailwind.config.js
2. Add more food items via the seed script
3. Create additional resources
4. Prepare for Part 2 - AI Integration

## Need Help?

Check the full README.md for:
- Detailed API documentation
- Database schema details
- Security features
- Project structure
- Future enhancements

---

**Happy coding! 🚀**
