import express from 'express';
import {
  addHabit,
  getHabits,
  updateHabit,
  toggleHabitToday,
  deleteHabit,
} from '../controllers/habitController.js';

const router = express.Router();

router.get('/', getHabits);
router.get('/all', getHabits);
router.post('/add', addHabit);
router.post('/toggle/:id', toggleHabitToday);
router.put('/update/:id', updateHabit);
router.delete('/delete/:id', deleteHabit);

export default router;
