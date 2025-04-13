import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import { Server, Socket } from 'socket.io';
import Message from './models/Message';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
});

app.use(cors());
app.use(express.json());

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

  socket.on('send_message', (data: any) => {
    console.log('📩 Message received:', data);
    socket.broadcast.emit('receive_message', data);
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