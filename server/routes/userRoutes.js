import express from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// All routes here require active authentication Bearer tokens!
router.use(protect);

router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

export default router;
