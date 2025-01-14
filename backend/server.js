import http from 'http';
import app from './app.js';
import 'dotenv/config';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';
import { generateResult } from './services/ai.service.js'
const port = process.env.PORT;

// Socket.io setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    const projectId = socket.handshake.query?.projectId;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error('Invalid Project Id'));
    }

    if (!token) {
      return next(new Error('Authentication error'));
    }

    // Fetch project and attach to socket
    const project = await projectModel.findById(projectId).lean();
    if (!project) {
      return next(new Error('Project not found'));
    }

    socket.project = project; // Attach project to socket

    // Verify JWT and attach user data to socket
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return next(new Error('Token is invalid'));
    }

    socket.user = decoded;
    next();
  } catch (error) {
    console.error(error); // Logging the error for debugging
    next(new Error('Authentication error')); // Send generic error to the client
  }
});


// Socket.io events
io.on('connection', (socket) => {
  socket.roomId = socket.project._id.toString()

  console.log('A user connected');
  socket.join(socket.roomId);

  socket.on('project-message', async (data) => {
    const message = data.message;
  
    const aiIsPresentInMessage = message.includes('@ai');
    socket.broadcast.to(socket.roomId).emit('project-message', data); // Broadcast to others in the room
  
    if (aiIsPresentInMessage) {
      const prompt = message.replace('@ai', '');
      const result = await generateResult(prompt);
  
      // Send AI generated result back to the same room
      io.to(socket.roomId).emit('project-message', {
        message: result,
        sender: {
          _id: 'ai',
          email: "AI",
        }
      });
  
      return;
    }
  });
  

  socket.on('disconnect', () => {
    console.log('User disconnected');
    socket.leave(socket.roomId);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
