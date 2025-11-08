/**
 * SOCKET.IO CONFIGURATION
 * Real-time communication setup for chat and live updates
 */

const { Server } = require('socket.io');

/**
 * Initialize Socket.IO server
 * @param {Object} server - HTTP server instance
 * @returns {Object} Socket.IO instance
 */
const initializeSocket = (server) => {
  // Create Socket.IO instance with CORS configuration
  const io = new Server(server, {
    cors: {
      // Allow the frontend dev server (both 3000 and 3001 for flexibility)
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Connection event - when a client connects
  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    /**
     * JOIN PROJECT ROOM
     * When user opens a project, they join that project's room
     * This allows broadcasting messages only to users in that project
     */
    socket.on('join-project', (projectId) => {
      socket.join(`project-${projectId}`);
      console.log(`👥 Socket ${socket.id} joined project-${projectId}`);
    });

    /**
     * LEAVE PROJECT ROOM
     * When user closes/leaves a project
     */
    socket.on('leave-project', (projectId) => {
      socket.leave(`project-${projectId}`);
      console.log(`👋 Socket ${socket.id} left project-${projectId}`);
    });

    /**
     * DISCONNECT EVENT
     * Clean up when client disconnects
     */
    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = { initializeSocket };
