import Progress from '../models/Progress.js';
import Habit from '../models/Habit.js';

/**
 * @desc    Mark a habit as complete for today
 * @route   POST /api/progress/mark-complete
 * @access  Private
 */
export const markHabitComplete = async (req, res) => {
  try {
    const { habitId, date, status } = req.body;

    // Always use the authenticated user — never trust a userId from the body.
    const userId = req.user._id;

    // Verify the habit belongs to this user before allowing progress tracking.
    const habit = await Habit.findById(habitId);
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    if (habit.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Forbidden: You can only track your own habits' });
    }

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
 * @desc    Get analytics for the authenticated user
 * @route   GET /api/progress/analytics
 * @access  Private
 */
export const getAnalytics = async (req, res) => {
  try {
    // Always scope to the authenticated user — ignore any userId from query.
    const userId = req.user._id;
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
 * @desc    Get current streaks for the authenticated user's habits
 * @route   GET /api/progress/streaks
 * @access  Private
 */
export const getStreaks = async (req, res) => {
  try {
    // Only return streaks for habits belonging to the authenticated user.
    const habits = await Habit.find({ userId: req.user._id });
    
    const streaks = habits.map(h => ({
      habit: h.title,
      currentStreak: h.streak
    }));

    res.json(streaks);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
