import express from 'express';
import { 
  getHabits, 
  createHabit, 
  updateHabit, 
  deleteHabit, 
  getHabitLogs, 
  toggleHabitLog 
} from '../controllers/habitController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// Enforce authentication on all core habit operations!
router.use(protect);

router.route('/')
  .get(getHabits)
  .post(createHabit);

router.route('/logs')
  .get(getHabitLogs);

router.route('/:id')
  .put(updateHabit)
  .delete(deleteHabit);

router.route('/:id/toggle')
  .post(toggleHabitLog);

export default router;
