import Message from '../models/Message.js';
import User from '../models/User.js';
import Session from '../models/Session.js';
import RoomActivity from '../models/RoomActivity.js';
import StudyRoom from '../models/StudyRoom.js';

// In-memory store for active study rooms state
const roomsState = {};

export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.id}`);

    let currentRoomCode = null;
    let currentUser = null;

    // User joins a study room
    socket.on('join_room', async ({ roomCode, user }) => {
      if (!roomCode || !user) return;

      currentRoomCode = roomCode.toUpperCase();
      currentUser = user;

      // Join the socket room channel
      socket.join(currentRoomCode);
      console.log(`User ${user.username} joined room channel: ${currentRoomCode}`);

      // Initialize room state in memory if it doesn't exist
      if (!roomsState[currentRoomCode]) {
        roomsState[currentRoomCode] = {
          secondsRemaining: 1500, // 25 min default
          totalDuration: 1500,
          isRunning: false,
          type: 'focus', // 'focus' or 'break'
          timerIntervalId: null,
          notes: 'Welcome to your collaborative study space! Start jotting down combined notes here...',
          typingUsers: {},
          participants: [],
        };
      }

      // Add user to the participant list if not already recorded in socket state
      const participantExists = roomsState[currentRoomCode].participants.some(
        (p) => p._id.toString() === user._id.toString()
      );
      if (!participantExists) {
        roomsState[currentRoomCode].participants.push(user);
      }

      // 1. Update Room DB participants list
      try {
        const room = await StudyRoom.findOne({ code: currentRoomCode });
        if (room && !room.participants.includes(user._id)) {
          room.participants.push(user._id);
          await room.save();
        }
      } catch (err) {
        console.error('Socket Join DB Error:', err);
      }

      // 2. Broadcast updated participants list to everyone in the room
      io.to(currentRoomCode).emit('participants_update', roomsState[currentRoomCode].participants);

      // 3. Send initial room state to the newly connected user
      socket.emit('room_state', {
        secondsRemaining: roomsState[currentRoomCode].secondsRemaining,
        totalDuration: roomsState[currentRoomCode].totalDuration,
        isRunning: roomsState[currentRoomCode].isRunning,
        type: roomsState[currentRoomCode].type,
        notes: roomsState[currentRoomCode].notes,
      });

      // 4. Broadcast system announcement inside the room
      socket.to(currentRoomCode).emit('system_message', {
        content: `${user.username} has entered the study room.`,
        timestamp: new Date(),
      });
    });

    // Handle timer action: START
    socket.on('start_timer', ({ roomCode, duration, type }) => {
      const code = roomCode.toUpperCase();
      const state = roomsState[code];
      if (!state || state.isRunning) return;

      state.isRunning = true;
      if (duration) {
        state.totalDuration = duration;
        state.secondsRemaining = duration;
      }
      if (type) {
        state.type = type;
      }

      // Log room activity
      try {
        StudyRoom.findOne({ code }).then((room) => {
          if (room) {
            RoomActivity.create({
              room: room._id,
              user: currentUser._id,
              action: state.type === 'focus' ? 'start_focus' : 'start_break',
              description: `${currentUser.username} started the ${state.type} session (${Math.round(state.totalDuration / 60)} mins).`,
            });
          }
        });
      } catch (err) {
        console.error('Socket start timer logging error:', err);
      }

      // Broadcast immediately to update button states on all clients
      io.to(code).emit('timer_update', {
        secondsRemaining: state.secondsRemaining,
        isRunning: true,
        type: state.type,
        totalDuration: state.totalDuration,
      });

      // Start tick interval on the server
      state.timerIntervalId = setInterval(async () => {
        state.secondsRemaining -= 1;

        if (state.secondsRemaining <= 0) {
          clearInterval(state.timerIntervalId);
          state.timerIntervalId = null;
          state.isRunning = false;

          // Timer expired!
          const completedType = state.type;
          const completedDuration = state.totalDuration;

          // Auto-toggle to the next state: Focus -> Break, Break -> Focus
          if (completedType === 'focus') {
            state.type = 'break';
            state.totalDuration = 300; // 5 min default short break
            state.secondsRemaining = 300;
          } else {
            state.type = 'focus';
            state.totalDuration = 1500; // 25 min default focus
            state.secondsRemaining = 1500;
          }

          // 1. Commit completed session record to database for all active participants
          try {
            const dbRoom = await StudyRoom.findOne({ code });
            if (dbRoom) {
              const attendeeIds = state.participants.map((p) => p._id);

              await Session.create({
                room: dbRoom._id,
                type: completedType,
                duration: completedDuration,
                startTime: new Date(Date.now() - completedDuration * 1000),
                endTime: new Date(),
                completed: true,
                attendees: attendeeIds,
              });

              // If it was a focus session, credit study time to every participant
              if (completedType === 'focus') {
                await User.updateMany(
                  { _id: { $in: attendeeIds } },
                  { $inc: { totalStudyTime: completedDuration }, $set: { lastActive: new Date() } }
                );

                // Re-credit daily streaks for participants
                for (const participant of state.participants) {
                  const u = await User.findById(participant._id);
                  if (u && u.dailyStreak === 0) {
                    u.dailyStreak = 1;
                    await u.save();
                  }
                }
              }

              // Log overall activity
              await RoomActivity.create({
                room: dbRoom._id,
                user: currentUser._id,
                action: completedType === 'focus' ? 'complete_focus' : 'complete_break',
                description: `Completed a ${Math.round(completedDuration / 60)} minute ${completedType} sprint.`,
              });
            }
          } catch (dbErr) {
            console.error('Auto Logging Session DB Error:', dbErr);
          }

          // 2. Broadcast completion trigger (clients play sound alarm, alert popup)
          io.to(code).emit('timer_complete', {
            completedType,
            nextType: state.type,
            nextDuration: state.totalDuration,
          });
        } else {
          // Regular tick broadcast
          io.to(code).emit('timer_update', {
            secondsRemaining: state.secondsRemaining,
            isRunning: true,
            type: state.type,
            totalDuration: state.totalDuration,
          });
        }
      }, 1000);

      roomsState[code] = state;
    });

    // Handle timer action: PAUSE
    socket.on('pause_timer', ({ roomCode }) => {
      const code = roomCode.toUpperCase();
      const state = roomsState[code];
      if (!state || !state.isRunning) return;

      state.isRunning = false;
      if (state.timerIntervalId) {
        clearInterval(state.timerIntervalId);
        state.timerIntervalId = null;
      }

      // Log room activity
      try {
        StudyRoom.findOne({ code }).then((room) => {
          if (room) {
            RoomActivity.create({
              room: room._id,
              user: currentUser._id,
              action: 'pause_focus',
              description: `${currentUser.username} paused the focus session.`,
            });
          }
        });
      } catch (err) {
        console.error(err);
      }

      io.to(code).emit('timer_update', {
        secondsRemaining: state.secondsRemaining,
        isRunning: false,
        type: state.type,
        totalDuration: state.totalDuration,
      });
    });

    // Handle timer action: RESET
    socket.on('reset_timer', ({ roomCode, duration, type }) => {
      const code = roomCode.toUpperCase();
      const state = roomsState[code];
      if (!state) return;

      state.isRunning = false;
      if (state.timerIntervalId) {
        clearInterval(state.timerIntervalId);
        state.timerIntervalId = null;
      }

      state.type = type || 'focus';
      state.totalDuration = duration || 1500;
      state.secondsRemaining = state.totalDuration;

      io.to(code).emit('timer_update', {
        secondsRemaining: state.secondsRemaining,
        isRunning: false,
        type: state.type,
        totalDuration: state.totalDuration,
      });
    });

    // Handle real-time Chat messages
    socket.on('send_message', async ({ roomCode, content }) => {
      if (!roomCode || !content || !currentUser) return;

      const code = roomCode.toUpperCase();

      try {
        const room = await StudyRoom.findOne({ code });
        if (!room) return;

        // Save message to DB
        const newMessage = await Message.create({
          room: room._id,
          sender: currentUser._id,
          content,
        });

        const populatedMessage = {
          _id: newMessage._id,
          room: room._id,
          content: newMessage.content,
          createdAt: newMessage.createdAt,
          sender: {
            _id: currentUser._id,
            username: currentUser.username,
            avatar: currentUser.avatar,
          },
        };

        // Broadcast message to everyone in the room
        io.to(code).emit('receive_message', populatedMessage);
      } catch (error) {
        console.error('Socket Send Message Error:', error);
      }
    });

    // Handle typing indicators
    socket.on('typing', ({ roomCode, isTyping }) => {
      if (!roomCode || !currentUser) return;
      const code = roomCode.toUpperCase();

      if (isTyping) {
        roomsState[code].typingUsers[currentUser._id] = currentUser.username;
      } else {
        delete roomsState[code].typingUsers[currentUser._id];
      }

      // Broadcast list of typing users
      socket.to(code).emit('user_typing_update', Object.values(roomsState[code].typingUsers));
    });

    // Handle shared notepad sync
    socket.on('update_notes', ({ roomCode, notes }) => {
      if (!roomCode) return;
      const code = roomCode.toUpperCase();

      if (roomsState[code]) {
        roomsState[code].notes = notes;
        // Broadcast the update to other participants in the room
        socket.to(code).emit('receive_notes', notes);
      }
    });

    // Handle manual disconnect or leaving
    socket.on('leave_room', async ({ roomCode, user }) => {
      if (!roomCode || !user) return;
      const code = roomCode.toUpperCase();

      socket.leave(code);

      if (roomsState[code]) {
        // Remove user from state list
        roomsState[code].participants = roomsState[code].participants.filter(
          (p) => p._id.toString() !== user._id.toString()
        );

        // Delete from typing indicators
        delete roomsState[code].typingUsers[user._id];

        // Broadcast updated details
        io.to(code).emit('participants_update', roomsState[code].participants);
        io.to(code).emit('user_typing_update', Object.values(roomsState[code].typingUsers));

        // System announcement
        io.to(code).emit('system_message', {
          content: `${user.username} has left the study room.`,
          timestamp: new Date(),
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket Disconnected: ${socket.id}`);

      // Handle cleaning if user disconnected abruptly
      if (currentRoomCode && currentUser && roomsState[currentRoomCode]) {
        const state = roomsState[currentRoomCode];

        state.participants = state.participants.filter(
          (p) => p._id.toString() !== currentUser._id.toString()
        );

        delete state.typingUsers[currentUser._id];

        io.to(currentRoomCode).emit('participants_update', state.participants);
        io.to(currentRoomCode).emit('user_typing_update', Object.values(state.typingUsers));

        io.to(currentRoomCode).emit('system_message', {
          content: `${currentUser.username} has left the study session.`,
          timestamp: new Date(),
        });

        // Clean room memory if completely empty
        if (state.participants.length === 0) {
          if (state.timerIntervalId) {
            clearInterval(state.timerIntervalId);
          }
          delete roomsState[currentRoomCode];
        }
      }
    });
  });
};
