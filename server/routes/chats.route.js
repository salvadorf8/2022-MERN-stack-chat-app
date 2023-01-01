const router = require('express').Router();
const Chat = require('../models/chat.model');
const Message = require('../models/message.model');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/create-new-chat', authMiddleware, async (req, res) => {
    try {
        const newChat = new Chat(req.body);
        const savedChat = await newChat.save();

        await savedChat.populate('members');

        res.send({
            success: true,
            message: 'chat created successfully',
            data: savedChat
        });
    } catch (error) {
        res.send({
            success: false,
            message: 'Error created chat',
            error: error.message
        });
    }
});

router.get('/get-all-chats', authMiddleware, async (req, res) => {
    try {
        const chats = await Chat.find({ members: { $in: [req.body.userId] } })
            .populate('members')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });
        res.send({
            message: 'chats fetched successfully',
            success: true,
            data: chats
        });
    } catch (error) {
        res.send({
            message: 'Error fetching chats',
            success: false,
            error: error.message
        });
    }
});

router.post('/clear-unread-messages', authMiddleware, async (req, res) => {
    try {
        const chat = await Chat.findById(req.body.chat);

        if (!chat) {
            return res.send({
                success: false,
                message: 'Chat not found'
            });
        }

        const updatedChat = await Chat.findByIdAndUpdate(req.body.chat, { unreadMessages: 0 }, { new: true }).populate('members').populate('lastMessage');

        await Message.updateMany({ chat: req.body.chat, read: false }, { read: true });
        // await Message.updateMany({ chat: req.body.chat, read: false }, { $set: { read: true }});
        // await Message.updateMany({ read: false, $set: { read: true } });

        res.send({ success: true, message: 'Unread messages cleared successfully', data: updatedChat });
    } catch (error) {
        res.send({
            success: false,
            message: 'Error clearing unread messages',
            error: error.message
        });
    }
});

module.exports = router;
