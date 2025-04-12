import { io } from 'socket.io-client';

const socket = io('https://laughing-computing-machine-5gwxg766w76274qx-5000.app.github.dev', {
  transports: ['websocket'],
});

export default socket;