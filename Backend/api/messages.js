const express = require('express');
const router = express.Router();
const Message = require('../model/message');

// GET messages by roomId
router.get('/:roomId', async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// DELETE a message by ID
router.delete('/:messageId', async (req, res) => {
  try {
    const deleted = await Message.findByIdAndDelete(req.params.messageId);
    if (!deleted) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.status(200).json({ success: true, id: deleted._id });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Error deleting message' });
  }
});

module.exports = router;
