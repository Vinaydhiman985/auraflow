import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: [true, 'Please provide a subject or habit title'],
      trim: true,
      default: 'General Study',
    },
    duration: {
      type: Number, // focus minutes completed
      required: true,
      min: [1, 'Study duration must be at least 1 minute'],
    },
    pomodoroCount: {
      type: Number,
      required: true,
      default: 1,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const StudySession = mongoose.model('StudySession', studySessionSchema);
export default StudySession;
