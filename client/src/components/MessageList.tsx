import React from 'react';
import { Message } from '../types';

type Props = {
  messages: Message[];
  username: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
};

const MessageList: React.FC<Props> = ({ messages, username, setMessages }) => {
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: username }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m._id !== id));
      } else {
        alert(data.error || 'Failed to delete message');
      }
    } catch (err) {
      console.error('❌ Error deleting message:', err);
    }
  };

  return (
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
  );
};

export default MessageList;