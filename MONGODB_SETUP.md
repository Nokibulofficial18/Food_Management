# MongoDB Setup Guide

## Quick Setup with MongoDB Atlas (Cloud) - RECOMMENDED

### Step 1: Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up for free (no credit card required)

### Step 2: Create a Cluster
1. After login, click "Build a Database"
2. Choose "FREE" tier (M0 Sandbox)
3. Select a cloud provider and region closest to you
4. Click "Create Cluster"

### Step 3: Create Database User
1. Click "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `admin`
5. Password: `admin123` (or create your own)
6. User Privileges: "Atlas admin"
7. Click "Add User"

### Step 4: Whitelist Your IP
1. Click "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### Step 5: Get Connection String
1. Click "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like):
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Update Backend .env File
1. Open: `backend\.env`
2. Replace the MONGODB_URI with your connection string
3. Replace `<password>` with your actual password
4. Example:
   ```
   MONGODB_URI=mongodb+srv://admin:admin123@cluster0.xxxxx.mongodb.net/food-management?retryWrites=true&w=majority
   ```

### Step 7: Restart Backend Server
```powershell
# Stop the current backend (Ctrl+C in backend terminal)
# Then restart:
cd backend
npm run dev
```

### Step 8: Seed the Database
```powershell
cd backend
npm run seed
```

---

## Alternative: Local MongoDB Installation

### Option A: Using Chocolatey
```powershell
# Install Chocolatey first (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install MongoDB
choco install mongodb

# Start MongoDB
mongod
```

### Option B: Manual Installation
1. Download: https://www.mongodb.com/try/download/community
2. Run installer
3. Choose "Complete" installation
4. Check "Install MongoDB as a Service"
5. After installation, start service:
   ```powershell
   net start MongoDB
   ```

---

## Verify Everything is Working

### Check Backend Connection
The backend console should show:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
```

### Access the Application
1. Frontend: http://localhost:3000
2. Backend API: http://localhost:5000/api/health

### Test Registration
1. Go to http://localhost:3000/register
2. Create an account
3. Login and explore!

---

## Current Status

✅ Backend server running on port 5000
✅ Frontend server running on port 3000
⏳ Waiting for MongoDB connection

**Recommended**: Use MongoDB Atlas (cloud) for fastest setup!
