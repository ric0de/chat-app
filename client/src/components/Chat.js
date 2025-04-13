// src/components/Chat.js
import React, { useState, useEffect } from 'react';
import socket from '../socket';

const Chat = () => {
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [username, setUsername] = useState('');
  const [hasJoined, setHasJoined] = useState(false);


  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('typing', (user) => {
      setIsTyping(`${user} is typing...`);
      setTimeout(() => setIsTyping(false), 1500); // hide after 1s
    });

    return () => {
      socket.off('receive_message');
      socket.off('typing');
    };
  }, []);

  const sendMessage = () => {
    if (msg.trim()) {
      const messageData = {
        sender: username,
        content: msg,
      };
      socket.emit('send_message', messageData);
      setMessages((prev) => [...prev, messageData]); // also shows your own msg instantly
      setMsg('');
    }
  };

  if (!hasJoined) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Enter your username to join the chat!</h2>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          onClick={() => {
            if (username.trim()) setHasJoined(true);
          }}
        >
          Join
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>💬 Chat</h2>
      <div>
        {messages.map((m, i) => (
          <div key={i}>
            <strong>{m.sender}:</strong> {m.content}
          </div>
        ))}
      </div>

      {/* Typing indicator */}
      {isTyping && <p><em>{isTyping}</em></p>}

      <input
        value={msg}
        onChange={(e) => {
          setMsg(e.target.value);
          socket.emit('typing', username); // Send typing event properly
        }}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;