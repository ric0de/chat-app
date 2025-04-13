import React, { useState, useEffect } from 'react';
import socket from '../socket';

type Message = {
  sender: string;
  content: string;
};

const Chat: React.FC = () => {
  const [msg, setMsg] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<string | false>(false);
  const [username, setUsername] = useState<string>('');
  const [hasJoined, setHasJoined] = useState<boolean>(false);


  useEffect(() => {
    socket.on('receive_message', (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('typing', (user: string) => {
      setIsTyping(`${user} is typing...`);
      setTimeout(() => setIsTyping(false), 1500); // hide after 1.5s
    });

    return () => {
      socket.off('receive_message');
      socket.off('typing');
    };
  }, []);

  const sendMessage = () => {
    if (msg.trim()) {
      const messageData: Message = {
        sender: username,
        content: msg,
      };
      socket.emit('send_message', messageData);
      setMessages((prev) => [...prev, messageData]); // show your own message
      setMsg('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMsg(e.target.value);
    socket.emit('typing', username);
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
        onChange={handleInputChange}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;