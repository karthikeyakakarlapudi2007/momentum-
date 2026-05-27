import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dns from 'dns';
import dotenv from 'dotenv';

// Import Routes
import userRoutes from './routes/userRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import progressRoutes from './routes/progressRoutes.js';

// Configuration
dotenv.config();

// Fix for MongoDB querySrv ECONNREFUSED error
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/progress', progressRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Test Home Route
app.get('/', (req, res) => {
  res.send('Momentum Backend Running');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
});