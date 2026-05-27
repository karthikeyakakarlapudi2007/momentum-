import Progress from '../models/Progress.js';
import Habit from '../models/Habit.js';

/**
 * @desc    Mark a habit as complete for today
 * @route   POST /api/progress/mark-complete
 * @access  Public
 */
export const markHabitComplete = async (req, res) => {
  try {
    const { userId, habitId, date, status } = req.body;

    // Use provided date or default to today (normalized to start of day)
    const trackDate = date ? new Date(date) : new Date();
    trackDate.setHours(0, 0, 0, 0);

    const progress = await Progress.findOneAndUpdate(
      { user: userId, habit: habitId, date: trackDate },
      { status: status || 'completed' },
      { upsert: true, new: true }
    );

    // If completed, we should ideally increment the streak in the Habit model
    if (status === 'completed' || !status) {
      await Habit.findByIdAndUpdate(habitId, { $inc: { streak: 1 }, completed: true });
    }

    res.status(200).json({
      message: 'Progress tracked successfully',
      progress,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Get analytics for a user
 * @route   GET /api/progress/analytics
 * @access  Public
 */
export const getAnalytics = async (req, res) => {
  try {
    const { userId } = req.query;
    const progressData = await Progress.find({ user: userId }).populate('habit');
    
    res.json({
      totalCompletions: progressData.length,
      data: progressData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Get current streaks for all habits
 * @route   GET /api/progress/streaks
 * @access  Public
 */
export const getStreaks = async (req, res) => {
  try {
    const { userId } = req.query;
    // For now, we fetch habits and their pre-calculated streaks
    const habits = await Habit.find({}); // In future, filter by userId
    
    const streaks = habits.map(h => ({
      habit: h.title,
      currentStreak: h.streak
    }));

    res.json(streaks);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
