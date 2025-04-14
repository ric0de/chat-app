import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import { Server, Socket } from 'socket.io';
import Message from './models/Message';
import messageRoutes from './routes/messages';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
});

app.set('io', io);
app.use(cors());
app.use(express.json());
app.use('/api/messages', messageRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI as string)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Basic route
app.get('/', (_req: Request, res: Response) => {
  res.send('Server is running 🚀');
});

// Socket.io
io.on('connection', (socket:Socket) => {
  console.log('🟢 New client connected');

  socket.on('send_username', (username: string) => {
    socket.data.username = username;
  
    const joinMsg = {
      sender: 'System',
      content: `${username} has joined the chat.`,
      room: 'main',
      createdAt: new Date().toISOString(),
    };
  
    socket.broadcast.emit('receive_message', joinMsg);
  });

  socket.on('send_message', async (data: { sender: string; content: string; room?: string }) => {
    try {
      const message = new Message({
        sender: data.sender,
        content: data.content,
        room: data.room || 'main',
      });
  
      const savedMessage = await message.save();
  
      console.log('✅ Message saved:', savedMessage);
  
      // Emit to everyone (including sender)
      io.emit('receive_message', savedMessage);
    } catch (err) {
      console.error('❌ Error saving message:', err);
    }
  });

  socket.on('disconnecting', async () => {
    const username = socket.data.username;
    if (username) {
      const leaveMessage = new Message({
        sender: 'System',
        content: `${username} has left the chat.`,
        room: 'main',
        createdAt: new Date().toISOString(),
      });

      io.emit('receive_message', leaveMessage);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected');
  });

  socket.on('typing', (username: string) => {
    socket.broadcast.emit('typing', username);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));