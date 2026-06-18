import express from 'express';
import {
  addHabit,
  getHabits,
  updateHabit,
  toggleHabitToday,
  deleteHabit,
} from '../controllers/habitController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Every habit endpoint requires a logged-in user.
router.use(protect);

router.get('/', getHabits);
router.get('/all', getHabits);
router.post('/', addHabit);
router.post('/add', addHabit);
router.post('/toggle/:id', toggleHabitToday);
router.put('/update/:id', updateHabit);
router.patch('/:id', updateHabit);
router.delete('/delete/:id', deleteHabit);
router.delete('/:id', deleteHabit);

export default router;
