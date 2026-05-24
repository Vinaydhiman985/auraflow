import express from 'express';
import { getSessions, createSession } from '../controllers/sessionController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSessions)
  .post(createSession);

export default router;
