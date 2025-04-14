// server/src/routes/messages.ts
import express from 'express';
import { Request, Response } from 'express';
import Message from '../models/Message';

const router = express.Router();

// GET /api/messages
router.get('/', async (_req: Request, res: Response) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 }); // oldest first
    res.status(200).json(messages);
  } catch (err) {
    console.error('❌ Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// DELETE /api/messages/:id
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const messageId = req.params.id;
  const sender = req.body.sender;

  console.log('🗑️ Attempting to delete:', messageId, 'by', sender);

  try {
    const message = await Message.findById(messageId);
    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    if (message.sender !== sender) {
      res.status(403).json({ error: 'You can only delete your own messages' });
      return;
    }

    await Message.findByIdAndDelete(messageId);
    // Emit to all clients that a message has been deleted
    req.app.get('io').emit('message_deleted', messageId);
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting message:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
