export type Message = {
    _id: string;
    sender: string;
    content: string;
    createdAt: string;
    room: string;
  };
  
  export type OutgoingMessage = {
    sender: string;
    content: string;
    room?: string;
  };