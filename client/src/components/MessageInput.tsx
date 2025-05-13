import React, { useState } from 'react';
import socket from '../socket';
import { OutgoingMessage } from '../types';

type Props = {
  username: string;
};

const MessageInput: React.FC<Props> = ({ username }) => {
  const [msg, setMsg] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMsg(e.target.value);
    socket.emit('typing', username);
  };

  const sendMessage = () => {
    if (msg.trim()) {
      const messageData: OutgoingMessage = {
        sender: username,
        content: msg,
        room: 'main',
      };
      socket.emit('send_message', messageData);
      setMsg('');
    }
  };

  return (
    <>
      <input
        value={msg}
        onChange={handleInputChange}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </>
  );
};

export default MessageInput;