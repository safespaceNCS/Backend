const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.Mixed, required: true }, // allow ObjectId or 'bot'
  receiver: { type: mongoose.Schema.Types.Mixed, required: true }, // allow ObjectId or 'bot'
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
