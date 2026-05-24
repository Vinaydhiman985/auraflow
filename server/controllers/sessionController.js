import StudySession from '../models/StudySession.js';

// 1. GET ALL STUDY SESSIONS
export const getSessions = async (req, res, next) => {
  try {
    const sessions = await StudySession.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    next(error);
  }
};

// 2. CREATE AND LOG NEW FOCUS STUDY SESSION
export const createSession = async (req, res, next) => {
  try {
    const { subject, duration, pomodoroCount } = req.body;

    if (!duration) {
      res.status(400);
      throw new Error('Please specify a focus duration.');
    }

    const session = await StudySession.create({
      userId: req.user.id,
      subject: subject || 'General Study',
      duration: Number(duration),
      pomodoroCount: Number(pomodoroCount || 1),
    });

    res.status(201).json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
};
