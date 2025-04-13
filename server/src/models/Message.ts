// server/src/models/Message.ts
import mongoose, { Document, Schema, model } from 'mongoose';

export interface IMessage extends Document {
  sender: string;
  content: string;
  createdAt: Date;
  room: string;
}

const MessageSchema: Schema = new Schema<IMessage>({
  sender: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  room: { type: String, default: 'main' },
});

const Message = model<IMessage>('Message', MessageSchema);
export default Message;