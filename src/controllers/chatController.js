const path = require("path");

exports.getChat = async (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
}