import express from 'express';
import {
  markHabitComplete,
  getAnalytics,
  getStreaks,
} from '../controllers/progressController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All progress routes require authentication — users must only
// interact with their own data.
router.use(protect);

router.post('/mark-complete', markHabitComplete);
router.get('/analytics', getAnalytics);
router.get('/streaks', getStreaks);

export default router;
