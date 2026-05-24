import Task from '../models/Task.js';

// 1. GET ALL USER TASKS
export const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });
    res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// 2. CREATE NEW TASK
export const createTask = async (req, res, next) => {
  try {
    const { title, priority, dueDate, linkedHabitId } = req.body;

    if (!title || !priority || !dueDate) {
      res.status(400);
      throw new Error('Please fill in all required fields (title, priority, dueDate).');
    }

    const task = await Task.create({
      userId: req.user.id,
      title,
      priority,
      dueDate,
      linkedHabitId: linkedHabitId || null,
    });

    res.status(201).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

// 3. UPDATE TASK DETAILS
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found.');
    }

    if (task.userId.toString() !== req.user.id) {
      res.status(403);
      throw new Error('Not authorized to modify this task.');
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// 4. DELETE TASK
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found.');
    }

    if (task.userId.toString() !== req.user.id) {
      res.status(403);
      throw new Error('Not authorized to delete this task.');
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// 5. TOGGLE TASK COMPLETION
export const toggleTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found.');
    }

    if (task.userId.toString() !== req.user.id) {
      res.status(403);
      throw new Error('Not authorized to access this task.');
    }

    task.completed = !task.completed;
    await task.save();

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};
