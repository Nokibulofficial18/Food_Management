import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import consumptionRoutes from './routes/consumptionRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import summaryRoutes from './routes/summaryRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

// Initialize dotenv
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/food-management')
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('\n⚠️  MongoDB is not running!');
    console.log('📖 Please see MONGODB_SETUP.md for setup instructions');
    console.log('🌐 Recommended: Use MongoDB Atlas (free cloud database)');
    console.log('   Visit: https://www.mongodb.com/cloud/atlas\n');
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/consumption', consumptionRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
