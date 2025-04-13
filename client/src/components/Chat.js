// src/components/Chat.js
import React, { useState, useEffect } from 'react';
import socket from '../socket';

const Chat = () => {
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('typing', () => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 1000); // hide after 1s
    });

    return () => {
      socket.off('receive_message');
      socket.off('typing');
    };
  }, []);

  const sendMessage = () => {
    if (msg.trim()) {
      const messageData = msg; // or you can make it an object later
      socket.emit('send_message', messageData);
      setMessages((prev) => [...prev, messageData]); // also show your own msg instantly
      setMsg('');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>💬 Chat</h2>
      <div>
        {messages.map((m, i) => (
          <div key={i}>{m}</div>
        ))}
      </div>
      {/* Typing indicator */}
      {isTyping && <p><em>Someone is typing...</em></p>}

      <input
        value={msg}
        onChange={(e) => {
          setMsg(e.target.value);
          socket.emit('typing'); // Send typing event properly
        }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;