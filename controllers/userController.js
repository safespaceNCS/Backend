const { User, Child, HotlineAgent } = require('../models/User');
const ChatMessage = require('../models/ChatMessage');
const ConsentState = require('../models/ConsentState');
const Alert = require('../models/Alert');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get child chat history (hotline agent only)
exports.getChildChats = async (req, res) => {
  try {
    const childId = req.params.id;
    const child = await Child.findById(childId);
    if (!child) return res.status(404).json({ error: 'Child not found' });
    const chats = await ChatMessage.find({ sender: childId });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete own child account (authenticated child only)
exports.deleteOwnAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    await ChatMessage.deleteMany({ sender: userId });
    await ConsentState.deleteOne({ child: userId });
    await Alert.deleteMany({ child: userId });
    await Child.findByIdAndDelete(userId);
    res.json({ message: 'Account and related data deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
