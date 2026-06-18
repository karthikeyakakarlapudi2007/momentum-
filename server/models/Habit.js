import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema(
  {
    // The frontend calls this field 'name'; the backend stores it as 'title'.
    // Both are accepted: the controller maps name->title before saving.
    title: {
      type: String,
      required: [true, 'Please add a habit title'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      // 'required' and 'default' together are redundant in Mongoose — if the
      // field is missing, the default fills it, so validation always passes.
      // Keeping default; removing the conflicting required flag.
      default: 'General',
      trim: true,
    },
    color: {
      type: String,
      default: '#7c5cfc',
    },
    // schedule: which days of the week the habit should be done.
    schedule: {
      type: [String],
      default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'custom'],
      default: 'daily',
    },
    // completions: ISO date strings (YYYY-MM-DD) for each day the habit was done.
    completions: {
      type: [String],
      default: [],
    },
    streak: {
      type: Number,
      default: 0,
    },
    targetStreak: {
      type: Number,
      default: 30,
    },
    targetBadge: {
      type: String,
      default: 'Champion',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    goal: {
      type: String,
      default: '',
      trim: true,
    },
    reminderTime: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    // Let Mongoose manage createdAt + updatedAt automatically.
    timestamps: true,
  }
);

// Index for fast per-user queries — every habit list query filters by userId.
habitSchema.index({ userId: 1 });

// MongoDB will automatically create the 'habits' collection when the first habit is inserted
const Habit = mongoose.model('Habit', habitSchema);

export default Habit;
