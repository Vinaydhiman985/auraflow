import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a habit title'],
      trim: true,
      maxlength: [50, 'Habit title cannot exceed 50 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: ['Study', 'Coding', 'Fitness', 'Reading', 'Sleep', 'Wellness'],
    },
    frequency: {
      type: String,
      default: 'daily',
    },
    targetDays: {
      type: Number,
      required: [true, 'Please provide target days per week'],
      min: [1, 'Target days must be at least 1'],
      max: [7, 'Target days cannot exceed 7'],
      default: 5,
    },
    color: {
      type: String,
      required: true,
      default: 'indigo',
    },
    icon: {
      type: String,
      required: true,
      default: 'GraduationCap',
    },
    subject: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const Habit = mongoose.model('Habit', habitSchema);
export default Habit;
