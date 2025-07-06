const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
  roomId: String,
  sender: String, // userId or username
  content: String,
  isGroup: Boolean,
  timestamp: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Message', messageSchema); 