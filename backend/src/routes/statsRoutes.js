import express from 'express';
import {
  getUserDashboardStats,
  getLeaderboard,
  logStudySession,
} from '../controllers/statsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // protect all stats routes

router.get('/dashboard', getUserDashboardStats);
router.get('/leaderboard', getLeaderboard);
router.post('/session', logStudySession);

export default router;
