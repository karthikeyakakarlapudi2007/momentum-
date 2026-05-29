import Habit from '../models/Habit.js';

/**
 * @desc    Add a new habit
 * @route   POST /api/habits/add
 * @access  Public
 */
export const addHabit = async (req, res) => {
  try {
    const { title, category, streak, completed } = req.body;

    const habit = await Habit.create({
      title,
      category,
      streak,
      completed,
    });

    res.status(201).json({
      message: 'Habit created successfully',
      habit,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Get all habits
 * @route   GET /api/habits/all
 * @access  Public
 */
export const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({});
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Update a habit
 * @route   PUT /api/habits/update/:id
 * @access  Public
 */
export const updateHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, streak, completed } = req.body;

    const habit = await Habit.findById(id);

    if (habit) {
      habit.title = title || habit.title;
      habit.category = category || habit.category;
      habit.streak = streak !== undefined ? streak : habit.streak;
      habit.completed = completed !== undefined ? completed : habit.completed;

      const updatedHabit = await habit.save();
      res.json({ message: 'Habit updated', habit: updatedHabit });
    } else {
      res.status(404).json({ message: 'Habit not found' });
    }
  } catch (error) {
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
 * @access  Public
 */
export const deleteHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const habit = await Habit.findById(id);

    if (habit) {
      await habit.deleteOne();
      res.json({ message: 'Habit removed successfully' });
    } else {
      res.status(404).json({ message: 'Habit not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
