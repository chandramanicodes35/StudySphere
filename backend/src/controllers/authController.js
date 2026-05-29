import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate Token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }

    // Create a random profile avatar index (e.g. avatar-1, avatar-2)
    const randomAvatar = `avatar-${Math.floor(Math.random() * 8) + 1}`;

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      avatar: randomAvatar,
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          dailyStreak: user.dailyStreak,
          totalStudyTime: user.totalStudyTime,
          settings: user.settings,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter all fields' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Update streak if active after 1 day or reset if long gone
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const lastActive = new Date(user.lastActive);
    const diffTime = Math.abs(now - lastActive);

    let streak = user.dailyStreak;
    if (diffTime > oneDay && diffTime < 2 * oneDay) {
      streak += 1;
    } else if (diffTime >= 2 * oneDay) {
      streak = 1; // reset to 1 if user missed a full day
    } else if (streak === 0) {
      streak = 1; // start streak
    }

    user.dailyStreak = streak;
    user.lastActive = now;
    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        dailyStreak: user.dailyStreak,
        totalStudyTime: user.totalStudyTime,
        settings: user.settings,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json({ success: true, data: user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
};

// @desc    Update user profile / settings
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.username = req.body.username || user.username;
      user.avatar = req.body.avatar || user.avatar;

      if (req.body.settings) {
        user.settings = {
          theme: req.body.settings.theme || user.settings.theme,
          dailyGoalSeconds: req.body.settings.dailyGoalSeconds ?? user.settings.dailyGoalSeconds,
          ambientVolume: req.body.settings.ambientVolume ?? user.settings.ambientVolume,
        };
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          avatar: updatedUser.avatar,
          dailyStreak: updatedUser.dailyStreak,
          totalStudyTime: updatedUser.totalStudyTime,
          settings: updatedUser.settings,
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};
