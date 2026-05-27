import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    habit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['completed', 'skipped', 'failed'],
      default: 'completed',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate entries for the same habit on the same day for a user
progressSchema.index({ user: 1, habit: 1, date: 1 }, { unique: true });

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;
