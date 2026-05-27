import express from 'express';
import {
  addHabit,
  getHabits,
  updateHabit,
  deleteHabit,
} from '../controllers/habitController.js';

const router = express.Router();

router.get('/', getHabits);
router.post('/add', addHabit);
router.get('/all', getHabits);
router.put('/update/:id', updateHabit);
router.delete('/delete/:id', deleteHabit);

export default router;
