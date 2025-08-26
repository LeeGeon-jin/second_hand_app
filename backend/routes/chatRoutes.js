// 聊天相关API路由
const express = require('express');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const router = express.Router();

// 创建或获取聊天会话
router.post('/', auth, async (req, res) => {
  try {
    const { participantId, productId } = req.body;
    
    if (!participantId) {
      return res.status(400).json({ message: '缺少参与者ID' });
    }

    // 检查是否已存在聊天会话
    const existingChat = await Chat.findOne({
      participants: { $all: [req.user.id, participantId] },
      $or: [
        { productId: productId },
        { productId: { $exists: false } }
      ]
    });

    if (existingChat) {
      return res.json(existingChat);
    }

    // 创建新的聊天会话
    const newChat = new Chat({
      participants: [req.user.id, participantId],
      productId: productId,
      createdBy: req.user.id
    });

    await newChat.save();
    res.status(201).json(newChat);
  } catch (error) {
    console.error('创建聊天失败:', error);
    res.status(500).json({ message: '创建聊天失败' });
  }
});

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
