import React from 'react';

type Props = {
  username: string;
  setUsername: (val: string) => void;
  onJoin: () => void;
};

const UsernamePrompt: React.FC<Props> = ({ username, setUsername, onJoin }) => {
  return (
    <div style={{ padding: 20 }}>
      <h2>Enter your username to join the chat!</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={onJoin}>Join</button>
    </div>
  );
};

export default UsernamePrompt;