// Chat controller for chat routes
const { handleChildChat } = require('./chatbotController');

// POST /api/chat
exports.childChat = async (req, res) => {
  try {
    const { message } = req.body;
    const childId = req.user.id;
    const { reply, severity, alert } = await handleChildChat(childId, message);
    res.json({ reply, severity, alert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
