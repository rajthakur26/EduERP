const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/jwt');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'], credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = verifyAccessToken(token);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.userId} (${socket.userRole})`);

    // Join personal room & role room
    socket.join(`user_${socket.userId}`);
    socket.join(socket.userRole);
    socket.join('all');

    socket.on('join_room', (room) => socket.join(room));
    socket.on('leave_room', (room) => socket.leave(room));

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.userId}`);
    });
  });

  return io;
};

const getIO = () => io;

module.exports = { initSocket, getIO };
