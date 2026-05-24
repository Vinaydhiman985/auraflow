import mongoose from 'mongoose';

const habitLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
    },
    date: {
      type: String, // String format: 'YYYY-MM-DD' representing local checking dates
      required: true,
    },
    completed: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce unique habit + date combination per user logging!
habitLogSchema.index({ habitId: 1, date: 1 }, { unique: true });

const HabitLog = mongoose.model('HabitLog', habitLogSchema);
export default HabitLog;
