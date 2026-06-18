import Habit from '../models/Habit.js';

/**
 * @desc    Add a new habit
 * @route   POST /api/habits/add
 * @access  Private
 */
export const addHabit = async (req, res) => {
  console.log('[addHabit] userId:', req.user?._id?.toString(), '| body keys:', Object.keys(req.body));
  try {
    const { name, title, category, streak, completed, color, schedule,
            frequency, completions, targetStreak, targetBadge,
            goal, reminderTime, notes, description } = req.body;

    // The frontend uses 'name' as the habit label; the schema stores it as 'title'.
    // Accept either so the API is robust to both.
    const resolvedTitle = (title || name || '').trim();
    if (!resolvedTitle) {
      return res.status(400).json({ message: 'Habit name/title is required' });
    }

    console.log('[addHabit] creating habit, title:', resolvedTitle);
    const habit = await Habit.create({
      title: resolvedTitle,
      description: description || '',
      category: category || 'General',
      color: color || '#7c5cfc',
      schedule: schedule || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      frequency: frequency || 'daily',
      completions: completions || [],
      streak: streak || 0,
      targetStreak: targetStreak || 30,
      targetBadge: targetBadge || 'Champion',
      completed: completed || false,
      goal: goal || '',
      reminderTime: reminderTime || '',
      notes: notes || '',
      userId: req.user._id,
    });
    console.log('[addHabit] habit saved to DB. _id:', habit._id.toString());

    res.status(201).json({
      message: 'Habit created successfully',
      habit,
    });
  } catch (error) {
    console.error('[addHabit] ERROR:', error.name, error.message);
    if (error.errors) console.error('[addHabit] validation:', JSON.stringify(error.errors));
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)[0]?.message || 'Invalid input';
      return res.status(400).json({ message });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Get all habits for the authenticated user
 * @route   GET /api/habits/all
 * @access  Private
 */
export const getHabits = async (req, res) => {
  console.log('[getHabits] userId:', req.user?._id?.toString());
  try {
    const habits = await Habit.find({ userId: req.user._id });
    console.log('[getHabits] found', habits.length, 'habits');
    res.json(habits);
  } catch (error) {
    console.error('[getHabits] ERROR:', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Update a habit
 * @route   PUT /api/habits/update/:id
 * @access  Private
 */
export const updateHabit = async (req, res) => {
  console.log('[updateHabit] id:', req.params.id, '| userId:', req.user?._id?.toString());
  try {
    const { id } = req.params;
    const { name, title, category, streak, completed, color, schedule,
            frequency, completions, targetStreak, targetBadge,
            goal, reminderTime, notes, description } = req.body;

    const habit = await Habit.findById(id);

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Ownership check — prevent users from editing another user's habits.
    if (habit.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own habits' });
    }

    // Accept both 'name' and 'title' from the frontend.
    const resolvedTitle = (title || name || '').trim();
    if (resolvedTitle) habit.title = resolvedTitle;
    if (category !== undefined)     habit.category     = category;
    if (description !== undefined)  habit.description  = description;
    if (color !== undefined)        habit.color        = color;
    if (schedule !== undefined)     habit.schedule     = schedule;
    if (frequency !== undefined)    habit.frequency    = frequency;
    if (completions !== undefined)  habit.completions  = completions;
    if (streak !== undefined)       habit.streak       = streak;
    if (targetStreak !== undefined) habit.targetStreak = targetStreak;
    if (targetBadge !== undefined)  habit.targetBadge  = targetBadge;
    if (completed !== undefined)    habit.completed    = completed;
    if (goal !== undefined)         habit.goal         = goal;
    if (reminderTime !== undefined) habit.reminderTime = reminderTime;
    if (notes !== undefined)        habit.notes        = notes;

    const updatedHabit = await habit.save();
    console.log('[updateHabit] saved. _id:', updatedHabit._id.toString());
    res.json({ message: 'Habit updated', habit: updatedHabit });
  } catch (error) {
    console.error('[updateHabit] ERROR:', error.name, error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Toggle today's completion for a habit (add or remove today's date)
 * @route   POST /api/habits/toggle/:id
 * @access  Public
 */
export const toggleHabitToday = async (req, res) => {
  try {
    const { id } = req.params;
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const habit = await Habit.findById(id);
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const alreadyDone = habit.completions.includes(today);

    if (alreadyDone) {
      // Remove today — untoggle
      habit.completions = habit.completions.filter((d) => d !== today);
      habit.completed = false;
      habit.streak = Math.max(0, habit.streak - 1);
    } else {
      // Add today — mark done
      habit.completions.push(today);
      habit.completed = true;
      habit.streak = habit.streak + 1;
    }

    await habit.save();

    res.json({
      message: alreadyDone ? 'Habit unmarked for today' : 'Habit marked complete for today',
      habit,
      toggled: !alreadyDone,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Delete a habit
 * @route   DELETE /api/habits/delete/:id
 * @access  Private
 */
export const deleteHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const habit = await Habit.findById(id);

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Ownership check — prevent users from deleting another user's habits.
    if (habit.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own habits' });
    }

    await habit.deleteOne();
    res.json({ message: 'Habit removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
