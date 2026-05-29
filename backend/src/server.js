import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

// Socket Handler
import { socketHandler } from './sockets/socketHandler.js';

// Load Environment variables
dotenv.config();

// Connect to MongoDB Database
connectDB();

const app = express();
const server = http.createServer(app);

// Setup Socket.IO with CORS settings
// backend/src/server.js
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL, // ← Must be set to your Vercel URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Express Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/stats', statsRoutes);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'An internal server error occurred',
  });
});

// Wire Socket.IO Handlers
socketHandler(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

const cors = require('cors')

// CORS for Express
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}))

// CORS for Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})