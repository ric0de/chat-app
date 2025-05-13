import { useEffect } from 'react';
import socket from '../socket';
import { Message } from '../types';

type Props = {
  username: string;
  hasJoined: boolean;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setIsTyping: React.Dispatch<React.SetStateAction<string | false>>;
};

const useChatSocket = ({ username, hasJoined, setMessages, setIsTyping }: Props) => {
  useEffect(() => {
    const handleConnect = () => {
      if (hasJoined && username) {
        socket.emit('send_username', username);
      }
    };

    const handleReceiveMessage = (data: Message) => {
      setMessages((prev) => {
        if (data._id && prev.some((m) => m._id === data._id)) return prev;
        return [...prev, data];
      });
    };

    const handleTyping = (user: string) => {
      setIsTyping(`${user} is typing...`);
      setTimeout(() => setIsTyping(false), 1500);
    };

    const handleDeleted = (deletedId: string) => {
      setMessages((prev) => prev.filter((m) => m._id !== deletedId));
    };

    socket.on('connect', handleConnect);
    socket.on('receive_message', handleReceiveMessage);
    socket.on('typing', handleTyping);
    socket.on('message_deleted', handleDeleted);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('typing', handleTyping);
      socket.off('message_deleted', handleDeleted);
    };
  }, [username, hasJoined]);
};

export default useChatSocket;