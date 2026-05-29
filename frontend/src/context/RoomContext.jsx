import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import api from '../services/api';

const RoomContext = createContext(null);

export const RoomProvider = ({ children }) => {
  const socket = useSocket();
  const { user } = useAuth();

  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [timerState, setTimerState] = useState({
    secondsRemaining: 1500,
    totalDuration: 1500,
    isRunning: false,
    type: 'focus',
  });
  const [chatMessages, setChatMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize and load room details
  const enterRoom = async (roomCode) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/rooms/${roomCode}`);
      const roomDetails = response.data;
      setRoom(roomDetails);

      // Load initial chat messages
      const msgResponse = await api.get(`/rooms/${roomDetails._id}/messages`);
      setChatMessages(msgResponse.data);
      
      return roomDetails;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Set up socket listeners for room events
  useEffect(() => {
    if (!socket || !room || !user) return;

    // Join room channel on socket server
    socket.emit('join_room', { roomCode: room.code, user });

    // 1. Listen for room state updates (timer, notes, etc.)
    socket.on('room_state', ({ secondsRemaining, totalDuration, isRunning, type, notes: initialNotes }) => {
      setTimerState({ secondsRemaining, totalDuration, isRunning, type });
      setNotes(initialNotes);
    });

    // 2. Listen for participant lists changes
    socket.on('participants_update', (participantList) => {
      setParticipants(participantList);
    });

    // 3. Listen for timer ticks
    socket.on('timer_update', ({ secondsRemaining, isRunning, type, totalDuration }) => {
      setTimerState({ secondsRemaining, totalDuration, isRunning, type });
    });

    // 4. Listen for timer completion alerts
    socket.on('timer_complete', ({ completedType, nextType, nextDuration }) => {
      setTimerState({
        secondsRemaining: nextDuration,
        totalDuration: nextDuration,
        isRunning: false,
        type: nextType,
      });

      // Play audio alert (standard focus/break bells)
      try {
        const audioUrl = completedType === 'focus' 
          ? 'https://assets.mixkit.co/active_storage/sfx/2869/2869-200.wav' // Bright ring
          : 'https://assets.mixkit.co/active_storage/sfx/911/911-200.wav'; // Calming chime
        const bell = new Audio(audioUrl);
        bell.volume = user?.settings?.ambientVolume ?? 0.5;
        bell.play();
      } catch (err) {
        console.log('Audio playback rejected by browser security settings until user interacts.', err);
      }

      // Add system announcement message
      setChatMessages((prev) => [
        ...prev,
        {
          _id: Math.random().toString(),
          system: true,
          content: `🎉 ${completedType === 'focus' ? 'Focus sprint completed!' : 'Break ended!'} Time to ${nextType === 'focus' ? 'focus' : 'take a break'}.`,
          createdAt: new Date(),
        },
      ]);
    });

    // 5. Listen for chat messages
    socket.on('receive_message', (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    // 6. Listen for system notifications
    socket.on('system_message', (msg) => {
      setChatMessages((prev) => [
        ...prev,
        {
          _id: Math.random().toString(),
          system: true,
          content: msg.content,
          createdAt: msg.timestamp,
        },
      ]);
    });

    // 7. Listen for typing updates
    socket.on('user_typing_update', (users) => {
      // Exclude logged in user from typing lists
      const filtered = users.filter((u) => u !== user.username);
      setTypingUsers(filtered);
    });

    // 8. Listen for shared notepad sync
    socket.on('receive_notes', (updatedNotes) => {
      setNotes(updatedNotes);
    });

    // Cleanup listeners when leaving the room or disconnecting socket
    return () => {
      socket.emit('leave_room', { roomCode: room.code, user });
      socket.off('room_state');
      socket.off('participants_update');
      socket.off('timer_update');
      socket.off('timer_complete');
      socket.off('receive_message');
      socket.off('system_message');
      socket.off('user_typing_update');
      socket.off('receive_notes');
    };
  }, [socket, room, user]);

  // Synchronized timer controls
  const startTimer = (duration, type) => {
    if (!socket || !room) return;
    socket.emit('start_timer', { roomCode: room.code, duration, type });
  };

  const pauseTimer = () => {
    if (!socket || !room) return;
    socket.emit('pause_timer', { roomCode: room.code });
  };

  const resetTimer = (duration, type) => {
    if (!socket || !room) return;
    socket.emit('reset_timer', { roomCode: room.code, duration, type });
  };

  // Synchronized chat controls
  const sendMessage = (content) => {
    if (!socket || !room || !content.trim()) return;
    socket.emit('send_message', { roomCode: room.code, content });
  };

  const setTypingState = (isTyping) => {
    if (!socket || !room) return;
    socket.emit('typing', { roomCode: room.code, isTyping });
  };

  // Synchronized collaborative notepad controls
  const updateNotes = (newNotes) => {
    setNotes(newNotes);
    if (!socket || !room) return;
    socket.emit('update_notes', { roomCode: room.code, notes: newNotes });
  };

  const leaveRoom = async () => {
    if (room) {
      try {
        await api.post(`/rooms/${room._id}/leave`);
      } catch (err) {
        console.error('Leave Room error API:', err);
      }
      setRoom(null);
      setParticipants([]);
      setChatMessages([]);
      setNotes('');
    }
  };

  return (
    <RoomContext.Provider
      value={{
        room,
        participants,
        timerState,
        chatMessages,
        typingUsers,
        notes,
        loading,
        error,
        enterRoom,
        leaveRoom,
        startTimer,
        pauseTimer,
        resetTimer,
        sendMessage,
        setTypingState,
        updateNotes,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used inside a RoomProvider');
  }
  return context;
};
