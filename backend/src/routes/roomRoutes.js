import express from 'express';
import {
  createRoom,
  joinRoom,
  leaveRoom,
  getRoomDetails,
  getRoomMessages,
  getUserRooms,
  getPublicRooms,
} from '../controllers/roomController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // protect all room routes

router.post('/', createRoom);
router.get('/', getPublicRooms);
router.post('/join', joinRoom);
router.post('/:id/leave', leaveRoom);
router.get('/user/all', getUserRooms);
router.get('/:idOrCode', getRoomDetails);
router.get('/:id/messages', getRoomMessages);

export default router;
