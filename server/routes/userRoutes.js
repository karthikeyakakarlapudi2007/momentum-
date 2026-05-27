import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
} from '../controllers/userController.js';

const router = express.Router();

// Public Routes
router.get('/', getAllUsers);
router.post('/register', registerUser);
router.post('/login', loginUser);

// Profile Route (To be made private later)
router.post('/profile', getUserProfile);

export default router;
