import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
    },
    priority: {
      type: String,
      required: true,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    dueDate: {
      type: String, // String format: 'YYYY-MM-DD' representing local due dates
      required: true,
    },
    linkedHabitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      default: null, // Optional habit linkage
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const Task = mongoose.model('Task', taskSchema);
export default Task;
