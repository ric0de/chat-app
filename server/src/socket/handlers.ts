import { Server, Socket } from 'socket.io';
import Message from '../models/Message';

export const setupSocketHandlers = (io: Server, socket: Socket) => {
  socket.on('send_username', (username: string) => {
    socket.data.username = username;
    socket.join('main');
    console.log(`🟢 ${username} connected`);
  });

  socket.on('send_message', async (data) => {
    const { sender, content, room = 'main' } = data;
    const newMsg = new Message({ sender, content, room });

    try {
      const saved = await newMsg.save();
      io.to(room).emit('receive_message', saved);
    } catch (err) {
      console.error('❌ Error saving message:', err);
    }
  });

  socket.on('typing', (username: string) => {
    socket.broadcast.to('main').emit('typing', username);
  });
};