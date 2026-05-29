import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import Habit from './models/Habit.js';
import Progress from './models/Progress.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

// Applying the DNS fix for SRV records as used in server.js
dns.setServers(['8.8.8.8', '8.8.4.4']);

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🌱 Connected to MongoDB for seeding...');

    // 1. Clear existing data to avoid clutter
    await User.deleteMany({});
    await Habit.deleteMany({});
    await Progress.deleteMany({});
    console.log('🧹 Existing data cleared.');

    // 2. Insert Sample Users
    const users = await User.insertMany([
      {
        name: 'Prashanth',
        email: 'prashanth@demo.com',
        password: 'password123',
      },
      {
        name: 'Momentum User',
        email: 'user@momentum.com',
        password: 'password123',
      },
    ]);
    console.log(`👤 Created ${users.length} sample users.`);

    // 3. Insert Sample Habits
    const habits = await Habit.insertMany([
      {
        title: 'Morning Meditation',
        category: 'Mental Health',
        streak: 5,
        completed: false,
      },
      {
        title: 'Drink 3L Water',
        category: 'Health',
        streak: 12,
        completed: true,
      },
      {
        title: 'Daily Coding',
        category: 'Work',
        streak: 20,
        completed: true,
      },
    ]);
    console.log(`🏃 Created ${habits.length} sample habits.`);

    // 4. Insert Sample Progress (Linking first user and first habit)
    await Progress.create({
      user: users[0]._id,
      habit: habits[0]._id,
      date: new Date().setHours(0, 0, 0, 0),
      status: 'completed',
    });
    console.log('📈 Sample progress record created.');

    console.log('✨ Database seeding finished successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
