const path = require("path");
const chatModel = require("../models/chatModel");

exports.getChat = async (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
};


exports.getChatHistory = async (req, res) => {
    try {
        const userType = req.user.userType;
        const identifier = userType === 'student' ? req.user.email : req.user.phoneNumber;
        const recipientEmail = req.query.recipientEmail;

        const history = await chatModel.getChatHistory(userType, identifier, recipientEmail);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};