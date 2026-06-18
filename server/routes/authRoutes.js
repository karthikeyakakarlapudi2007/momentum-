import express from 'express';
import { googleAuth } from '../controllers/authController.js';

const router = express.Router();

// Public Route for Google Auth token verification
router.post('/google', googleAuth);

export default router;
