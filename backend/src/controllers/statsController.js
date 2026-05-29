import User from '../models/User.js';
import Session from '../models/Session.js';
import RoomActivity from '../models/RoomActivity.js';
import StudyRoom from '../models/StudyRoom.js';

// @desc    Get user dashboard statistics
// @route   GET /api/stats/dashboard
// @access  Private
export const getUserDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch user data (streak and total study time)
    const user = await User.findById(userId).select('totalStudyTime dailyStreak lastActive');

    // 2. Count completed sessions
    const sessionsCount = await Session.countDocuments({
      attendees: userId,
      completed: true,
    });

    // 3. Find active rooms user is in
    const activeRoomsCount = await StudyRoom.countDocuments({
      participants: userId,
    });

    // 4. Fetch recent activity (recent 10 logs)
    const recentActivities = await RoomActivity.find({ user: userId })
      .populate('room', 'name code')
      .sort({ createdAt: -1 })
      .limit(10);

    // 5. Gather daily study chart data for the past 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sessions = await Session.find({
      attendees: userId,
      completed: true,
      startTime: { $gte: sevenDaysAgo },
    });

    // Aggregate by day of the week
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const chartDataMap = {};

    // Initialize past 7 days with 0 mins
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = dayNames[d.getDay()];
      chartDataMap[dayName] = 0;
    }

    sessions.forEach((session) => {
      const dayName = dayNames[new Date(session.startTime).getDay()];
      if (chartDataMap[dayName] !== undefined) {
        chartDataMap[dayName] += Math.round(session.duration / 60); // convert seconds to minutes
      }
    });

    const chartData = Object.keys(chartDataMap).map((key) => ({
      day: key,
      minutes: chartDataMap[key],
    }));

    res.json({
      success: true,
      data: {
        totalStudyTime: user.totalStudyTime,
        dailyStreak: user.dailyStreak,
        completedSessions: sessionsCount,
        activeRooms: activeRoomsCount,
        recentActivities,
        chartData,
      },
    });
  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving statistics' });
  }
};

// @desc    Get top users leaderboard
// @route   GET /api/stats/leaderboard
// @access  Private
export const getLeaderboard = async (req, res) => {
  try {
    // Top 10 by study time
    const topStudyTime = await User.find({})
      .select('username avatar totalStudyTime dailyStreak')
      .sort({ totalStudyTime: -1 })
      .limit(10);

    // Top 10 by daily streak
    const topStreak = await User.find({})
      .select('username avatar totalStudyTime dailyStreak')
      .sort({ dailyStreak: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        topStudyTime,
        topStreak,
      },
    });
  } catch (error) {
    console.error('Get Leaderboard Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving leaderboard' });
  }
};

// @desc    Record completed manual/timer study session
// @route   POST /api/stats/session
// @access  Private
export const logStudySession = async (req, res) => {
  const { roomId, durationSeconds, sessionType } = req.body;

  try {
    if (!durationSeconds || durationSeconds <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid session duration' });
    }

    // 1. Record the session
    const session = await Session.create({
      room: roomId,
      type: sessionType || 'focus',
      duration: durationSeconds,
      startTime: new Date(Date.now() - durationSeconds * 1000),
      endTime: new Date(),
      completed: true,
      attendees: [req.user._id],
    });

    // 2. Update user's cumulative time
    const user = await User.findById(req.user._id);
    user.totalStudyTime += parseInt(durationSeconds, 10);
    user.lastActive = new Date();
    await user.save();

    // 3. Log activity
    await RoomActivity.create({
      room: roomId,
      user: req.user._id,
      action: sessionType === 'break' ? 'complete_break' : 'complete_focus',
      description: `${req.user.username} finished a ${Math.round(durationSeconds / 60)} min ${sessionType || 'focus'} session.`,
    });

    res.status(201).json({
      success: true,
      data: {
        session,
        totalStudyTime: user.totalStudyTime,
      },
    });
  } catch (error) {
    console.error('Log Session Error:', error);
    res.status(500).json({ success: false, message: 'Server error recording study session' });
  }
};
