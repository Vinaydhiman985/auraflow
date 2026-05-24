import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

// Router Imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';

// 1. Load configurations
dotenv.config();

// 2. Connect database Mongoose
connectDB();

const app = express();

// 3. Configure Standard Middleware
const corsOptions = {
  origin: 'http://localhost:5173', // Pinned React Vite Client
  credentials: true, // Allow secure HTTP-Only cookies to sync
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// 4. Register REST API Routers
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/sessions', sessionRoutes);

// 5. Default API Status checking endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HabitFlow API is active and fully functional ⚡',
    timestamp: new Date().toISOString(),
  });
});

// 6. Centralized custom Error Interception Handler
app.use(errorHandler);

// 7. Boot listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
