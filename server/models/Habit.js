import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a habit title'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    default: 'General',
  },
  streak: {
    type: Number,
    default: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  // Array of ISO date strings (YYYY-MM-DD) representing days this habit was completed
  completions: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// MongoDB will automatically create the 'habits' collection when the first habit is inserted
const Habit = mongoose.model('Habit', habitSchema);

export default Habit;
