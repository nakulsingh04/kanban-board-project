import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { serverConfig } from './utils/config.js';
// Using built-in fetch API (available in Node.js 18+)
dotenv.config();

import { errorHandler, notFound } from './utils/asyncHandler.js';

// Import routes
import taskRoutes from './routes/tasks.js';

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: serverConfig.cors.origin,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
  }
});

// Make io available to routes
app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors({
  origin: serverConfig.cors.origin,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: serverConfig.rateLimit.windowMs,
  max: serverConfig.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/tasks', taskRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  // Join a room for real-time updates
  socket.on('join:board', (boardId) => {
    socket.join(`board:${boardId}`);
  });

  // Leave a room
  socket.on('leave:board', (boardId) => {
    socket.leave(`board:${boardId}`);
  });

  // Handle task movement from client
  socket.on('task:move', async (data) => {
    try {
      // The frontend now makes the HTTP request directly, so we just broadcast the event
      // Broadcast to ALL clients (including sender) for real-time sync
      io.emit('task:moved', {
        taskId: data.taskId,
        sourceColumnId: data.sourceColumnId,
        destinationColumnId: data.destinationColumnId,
        newIndex: data.newIndex
      });
    } catch (error) {
      // Handle error silently
    }
  });

  // Handle task creation from client
  socket.on('task:create', (data) => {
    // Broadcast to ALL clients for real-time sync
    io.emit('task:created', data);
  });

  // Handle task deletion from client
  socket.on('task:delete', (data) => {
    // Broadcast to ALL clients for real-time sync
    io.emit('task:deleted', data);
  });

  // Handle task updates from client
  socket.on('task:update', (data) => {
    // Broadcast to ALL clients for real-time sync
    io.emit('task:updated', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    // Client disconnected
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(serverConfig.mongodb.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = serverConfig.server.port;

const startServer = async () => {
  await connectDB();
  
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});

startServer();
