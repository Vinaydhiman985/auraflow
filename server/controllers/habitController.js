import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';

// 1. GET ALL USER HABITS
export const getHabits = async (req, res, next) => {
  try {
    const habits = await Habit.find({ userId: req.user.id });
    res.status(200).json({
      success: true,
      habits,
    });
  } catch (error) {
    next(error);
  }
};

// 2. CREATE NEW HABIT
export const createHabit = async (req, res, next) => {
  try {
    const { title, category, frequency, targetDays, color, icon, subject } = req.body;

    if (!title || !category || !targetDays || !color || !icon) {
      res.status(400);
      throw new Error('Please fill in all required fields (title, category, targetDays, color, icon).');
    }

    const habit = await Habit.create({
      userId: req.user.id,
      title,
      category,
      frequency,
      targetDays: Number(targetDays),
      color,
      icon,
      subject,
    });

    res.status(201).json({
      success: true,
      habit,
    });
  } catch (error) {
    next(error);
  }
};

// 3. UPDATE HABIT DETAILS
export const updateHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      res.status(404);
      throw new Error('Habit not found.');
    }

    // Verify ownership
    if (habit.userId.toString() !== req.user.id) {
      res.status(403);
      throw new Error('Not authorized to modify this habit.');
    }

    const updatedHabit = await Habit.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      habit: updatedHabit,
    });
  } catch (error) {
    next(error);
  }
};

// 4. DELETE HABIT & ITS COMPLETED LOG HISTORY
export const deleteHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      res.status(404);
      throw new Error('Habit not found.');
    }

    if (habit.userId.toString() !== req.user.id) {
      res.status(403);
      throw new Error('Not authorized to delete this habit.');
    }

    // Remove habit logs as well prior to deleting habit
    await HabitLog.deleteMany({ habitId: req.params.id });
    await Habit.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Habit and all associated logs deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// 5. GET ALL HABIT LOG HISTORY FOR USER
export const getHabitLogs = async (req, res, next) => {
  try {
    const logs = await HabitLog.find({ userId: req.user.id });
    
    // Convert flat database logs list to frontend-ready habitId-indexed date arrays!
    // Format: { "habitId-1": ["2026-05-24", "2026-05-23"] }
    const formattedLogs = {};
    logs.forEach(log => {
      if (!formattedLogs[log.habitId]) {
        formattedLogs[log.habitId] = [];
      }
      formattedLogs[log.habitId].push(log.date);
    });

    res.status(200).json({
      success: true,
      logs: formattedLogs,
    });
  } catch (error) {
    next(error);
  }
};

// 6. TOGGLE HABIT CHECK-OFF FOR DATE
export const toggleHabitLog = async (req, res, next) => {
  try {
    const { date } = req.body; // Expect format YYYY-MM-DD
    const habitId = req.params.id;

    if (!date) {
      res.status(400);
      throw new Error('Please specify a date (YYYY-MM-DD) to toggle completion.');
    }

    // Verify habit ownership
    const habit = await Habit.findById(habitId);
    if (!habit) {
      res.status(404);
      throw new Error('Habit not found.');
    }
    if (habit.userId.toString() !== req.user.id) {
      res.status(403);
      throw new Error('Not authorized to access this routine.');
    }

    // Check if log entry exists
    const existingLog = await HabitLog.findOne({ habitId, date });

    if (existingLog) {
      // Remove completion log
      await HabitLog.findByIdAndDelete(existingLog._id);
      res.status(200).json({
        success: true,
        completed: false,
        message: 'Habit log deleted successfully.',
      });
    } else {
      // Add completion log
      const newLog = await HabitLog.create({
        userId: req.user.id,
        habitId,
        date,
        completed: true,
      });
      res.status(201).json({
        success: true,
        completed: true,
        log: newLog,
        message: 'Habit log created successfully.',
      });
    }
  } catch (error) {
    next(error);
  }
};
