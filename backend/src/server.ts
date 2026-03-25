import app from './app';
import { createSocketServer } from './socket/server';

const PORT = parseInt(process.env.PORT || '3001', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${NODE_ENV} mode`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Initialize WebSocket server
createSocketServer(server);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received: shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received: shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
