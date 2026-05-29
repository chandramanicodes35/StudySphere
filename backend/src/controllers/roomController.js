import StudyRoom from '../models/StudyRoom.js';
import Message from '../models/Message.js';
import RoomActivity from '../models/RoomActivity.js';
import crypto from 'crypto';

// Helper to generate unique 6-char room code
const generateRoomCode = async () => {
  let isUnique = false;
  let code = '';

  while (!isUnique) {
    code = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
    const existingRoom = await StudyRoom.findOne({ code });
    if (!existingRoom) {
      isUnique = true;
    }
  }
  return code;
};

// @desc    Create a new study room
// @route   POST /api/rooms
// @access  Private
export const createRoom = async (req, res) => {
  const { name, description, isPrivate } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ success: false, message: 'Room name is required' });
    }

    const code = await generateRoomCode();

    const room = await StudyRoom.create({
      name,
      description,
      code,
      owner: req.user._id,
      participants: [req.user._id], // creator is the first participant
      isPrivate: isPrivate || false,
    });

    // Log action
    await RoomActivity.create({
      room: room._id,
      user: req.user._id,
      action: 'join',
      description: `${req.user.username} created and joined the room.`,
    });

    res.status(201).json({ success: true, data: room });
  } catch (error) {
    console.error('Create Room Error:', error);
    res.status(500).json({ success: false, message: 'Server error creating room' });
  }
};

// @desc    Join a study room using room code
// @route   POST /api/rooms/join
// @access  Private
export const joinRoom = async (req, res) => {
  const { code } = req.body;

  try {
    if (!code) {
      return res.status(400).json({ success: false, message: 'Room code is required' });
    }

    const room = await StudyRoom.findOne({ code: code.toUpperCase() });

    if (!room) {
      return res.status(404).json({ success: false, message: 'Study room not found with this code' });
    }

    // Add user to participants if not already inside
    if (!room.participants.includes(req.user._id)) {
      room.participants.push(req.user._id);
      await room.save();

      // Log action
      await RoomActivity.create({
        room: room._id,
        user: req.user._id,
        action: 'join',
        description: `${req.user.username} joined the room.`,
      });
    }

    res.json({ success: true, data: room });
  } catch (error) {
    console.error('Join Room Error:', error);
    res.status(500).json({ success: false, message: 'Server error joining room' });
  }
};

// @desc    Leave a study room
// @route   POST /api/rooms/:id/leave
// @access  Private
export const leaveRoom = async (req, res) => {
  try {
    const room = await StudyRoom.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Study room not found' });
    }

    // Remove user from participants
    room.participants = room.participants.filter(
      (pId) => pId.toString() !== req.user._id.toString()
    );
    await room.save();

    // Log action
    await RoomActivity.create({
      room: room._id,
      user: req.user._id,
      action: 'leave',
      description: `${req.user.username} left the room.`,
    });

    res.json({ success: true, message: 'Successfully left the room' });
  } catch (error) {
    console.error('Leave Room Error:', error);
    res.status(500).json({ success: false, message: 'Server error leaving room' });
  }
};

// @desc    Get room details by ID or code
// @route   GET /api/rooms/:idOrCode
// @access  Private
export const getRoomDetails = async (req, res) => {
  const { idOrCode } = req.params;

  try {
    let room;
    // Check if valid ObjectId or a 6-char code
    if (idOrCode.length === 6) {
      room = await StudyRoom.findOne({ code: idOrCode.toUpperCase() })
        .populate('owner', 'username email avatar')
        .populate('participants', 'username email avatar dailyStreak');
    } else {
      room = await StudyRoom.findById(idOrCode)
        .populate('owner', 'username email avatar')
        .populate('participants', 'username email avatar dailyStreak');
    }

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.json({ success: true, data: room });
  } catch (error) {
    console.error('Get Room Details Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving room details' });
  }
};

// @desc    Get chat message history for a room
// @route   GET /api/rooms/:id/messages
// @access  Private
export const getRoomMessages = async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.id })
      .populate('sender', 'username avatar')
      .sort({ createdAt: 1 })
      .limit(100); // return last 100 messages

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Get Messages Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving messages' });
  }
};

// @desc    Get rooms created by or joined by the user
// @route   GET /api/rooms/user/all
// @access  Private
export const getUserRooms = async (req, res) => {
  try {
    // Find rooms where user is owner or participant
    const rooms = await StudyRoom.find({
      $or: [{ owner: req.user._id }, { participants: req.user._id }],
    })
      .populate('owner', 'username avatar')
      .populate('participants', 'username avatar')
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: rooms });
  } catch (error) {
    console.error('Get User Rooms Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving user rooms' });
  }
};

// @desc    Get all public rooms
// @route   GET /api/rooms
// @access  Private
export const getPublicRooms = async (req, res) => {
  try {
    const rooms = await StudyRoom.find({ isPrivate: false })
      .populate('owner', 'username avatar')
      .populate('participants', 'username avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: rooms });
  } catch (error) {
    console.error('Get Public Rooms Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving public rooms' });
  }
};
