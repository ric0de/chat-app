import React, { useState, useEffect } from 'react';
import socket from '../socket';

type Message = {
  _id: string;
  sender: string;
  content: string;
  createdAt: string;
  room: string;
};

type OutgoingMessage = {
  sender: string;
  content: string;
  room?: string;
};

const Chat: React.FC = () => {
  const [msg, setMsg] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<string | false>(false);
  const [username, setUsername] = useState<string>('');
  const [hasJoined, setHasJoined] = useState<boolean>(false);

  const fetchMessages = async () => {
    try {
      const res = await fetch('https://laughing-computing-machine-5gwxg766w76274qx-5000.app.github.dev/api/messages');
      const data = await res.json();
      console.log('📥 Messages fetched:', data);
      setMessages(data);
    } catch (err) {
      console.error('❌ Failed to load messages:', err);
    }
  };


  useEffect(() => {

    const handleConnect = () => {
      if (hasJoined && username) {
        socket.emit('send_username', username);
      }
    };

    socket.on('connect', handleConnect);

    socket.on('receive_message', (data: Message) => {
      setMessages((prev) => {
        // Avoid duplicate messages by _id
        if (data._id && prev.some((m) => m._id === data._id)) return prev;
        return [...prev, data];
      });
    });

    socket.on('typing', (user: string) => {
      setIsTyping(`${user} is typing...`);
      setTimeout(() => setIsTyping(false), 1500); // hide after 1.5s
    });

    socket.on('message_deleted', (deletedId: string) => {
      setMessages((prev) => prev.filter((m) => m._id !== deletedId));
    });

    return () => {
      socket.off('connect', handleConnect);
      socket.off('receive_message');
      socket.off('typing');
      socket.off('message_deleted');
    };
  }, [hasJoined, username]);

  useEffect(() => {
    if (hasJoined) {
      fetchMessages();
    }
  }, [hasJoined]);

  const sendMessage = () => {
    if (msg.trim()) {
      const messageData: OutgoingMessage = {
        sender: username,
        content: msg,
        room: 'main',
      };
      socket.emit('send_message', messageData);
      // setMessages((prev) => [...prev, messageData]); // undid bc of dupes
      setMsg('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMsg(e.target.value);
    socket.emit('typing', username);
  };

  const handleDelete = async (id: string) => {
    console.log('🔍 Deleting message with ID:', id);
    try {
      const res = await fetch(
        `https://laughing-computing-machine-5gwxg766w76274qx-5000.app.github.dev/api/messages/${id}`, 
        {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sender: username }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        // Remove deleted message from UI
        setMessages((prev) => prev.filter((m) => m._id !== id));
      } else {
        alert(data.error || 'Failed to delete message');
      }
    } catch (err) {
      console.error('❌ Error deleting message:', err);
      if (err instanceof Error) {
        alert(`Something went wrong: ${err.message}`);
      } else {
        alert('Something went wrong');
      }
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
            if (username.trim()) {
              setHasJoined(true);
              fetchMessages();
              socket.emit('send_username', username);
            }
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
          <div key={i} style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div>
              <strong>{m.sender}:</strong> {m.content}
            </div>
            {m.sender === username && (
              <button
                onClick={() => handleDelete(m._id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'red',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
                title="Delete message"
              >
                🗑️
              </button>
            )}
          </div>
          <div style={{ fontSize: '0.75em', color: 'gray', marginLeft: '4px' }}>
            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
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