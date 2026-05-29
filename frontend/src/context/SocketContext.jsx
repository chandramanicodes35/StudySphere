import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    let socketInstance = null;

    if (user) {
      // Connect to the socket server (proxied locally through Vite config)
      socketInstance = io(window.location.origin, {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
      });

      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        console.log('Socket Context: Established connection.');
      });

      socketInstance.on('disconnect', (reason) => {
        console.log(`Socket Context: Disconnected. Reason: ${reason}`);
      });
    } else {
      // Disconnect socket if user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
