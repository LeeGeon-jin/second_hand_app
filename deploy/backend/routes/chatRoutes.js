// 聊天相关API路由
const express = require('express');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const router = express.Router();

// 获取我的所有聊天
router.get('/', auth, async (req, res) => {
  const chats = await Chat.find({ participants: req.user.id }).populate('participants', 'username');
  res.json(chats);
});

// 发送消息
router.post('/:chatId/messages', auth, async (req, res) => {
  const { content, type } = req.body;
  const message = new Message({
    chat: req.params.chatId,
    sender: req.user.id,
    content,
    type: type || 'text'
  });
  await message.save();
  await Chat.findByIdAndUpdate(req.params.chatId, { $push: { messages: message._id }, lastMessageAt: new Date() });
  res.json({ message: '发送成功', data: message });
});

// 获取聊天记录
router.get('/:chatId/messages', auth, async (req, res) => {
  const messages = await Message.find({ chat: req.params.chatId }).sort({ createdAt: 1 });
  res.json(messages);
});

module.exports = router;
