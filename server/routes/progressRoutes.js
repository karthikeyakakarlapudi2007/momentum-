import express from 'express';
import {
  markHabitComplete,
  getAnalytics,
  getStreaks,
} from '../controllers/progressController.js';

const router = express.Router();

router.post('/mark-complete', markHabitComplete);
router.get('/analytics', getAnalytics);
router.get('/streaks', getStreaks);

export default router;
