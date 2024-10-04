const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Route to fetch message history between two users
router.get('/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

// Route to clear chat history
router.delete('/clear', async (req, res) => {
  try {
    await Message.deleteMany({});
    res.status(200).json({ message: 'Chat history cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
});

module.exports = router;
