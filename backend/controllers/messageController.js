const Message = require('../models/Message');
const User    = require('../models/User');

// @desc  Get chat history for a room
// @route GET /api/messages/:room
exports.getRoomMessages = async (req, res) => {
  const messages = await Message.find({ room: req.params.room })
    .populate('sender', 'name avatarUrl role')
    .sort({ createdAt: 1 })
    .limit(100);
  res.json({ success: true, count: messages.length, data: messages });
};

// @desc  Save a message (REST fallback — socket.io is primary)
// @route POST /api/messages
exports.saveMessage = async (req, res) => {
  const { room, content } = req.body;
  if (!room || !content)
    return res.status(400).json({ success: false, message: 'room and content are required' });

  const message = await Message.create({
    room,
    sender:  req.user._id,
    content: content.trim(),
  });

  const populated = await message.populate('sender', 'name avatarUrl role');
  res.status(201).json({ success: true, data: populated });
};

// @desc  Get list of users the current user can chat with
// @route GET /api/messages/contacts
exports.getContacts = async (req, res) => {
  // Freshers see startups; startups see freshers
  const oppositeRole = req.user.role === 'fresher' ? 'startup' : 'fresher';
  const contacts = await User.find({ role: oppositeRole, isActive: true })
    .select('name avatarUrl companyName college role')
    .limit(50);
  res.json({ success: true, data: contacts });
};
