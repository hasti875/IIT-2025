const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const { initializeSocket } = require('./config/socket');
require('./models'); // Import models to register associations

const PORT = process.env.PORT || 5000;

// Create HTTP server (needed for Socket.IO)
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Make io accessible to controllers
app.set('io', io);

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to PostgreSQL
    await connectDB();

    // Start HTTP server with Socket.IO
    server.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 OneFlow - Plan to Bill in One Place                 ║
║                                                           ║
║   Server running on port ${PORT}                            ║
║   Environment: ${process.env.NODE_ENV || 'development'}                       ║
║   API Base URL: http://localhost:${PORT}/api              ║
║   Socket.IO: ✅ Real-time enabled                         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Start the server
startServer();
