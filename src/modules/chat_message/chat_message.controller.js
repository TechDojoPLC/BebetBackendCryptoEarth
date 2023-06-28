const chatService = require("./chat_message.service");


function GetAll(req, res) {
    chatService
        .GetAll(req)
        .then((data) => res.status(200).json(data))
        .catch((err) => {
            res.status(400).json({ error: err.message });
        }); 
}
function Get(req, res) {
    const _id = req.params.id
    chatService
        .Get({_id: _id})
        .then((data) => res.status(200).json(data))
        .catch((err) => {
            res.status(400).json({ error: err.message });
        }); 
}
function GetByChatRoom(req, res) {
    const _id = req.params.id
    chatService
        .GetByChatRoom({chat: _id})
        .then((data) => res.status(200).json(data))
        .catch((err) => {
            res.status(400).json({ error: err.message });
        }); 
}
module.exports = {
    GetAll,
    Get,
    GetByChatRoom,
};
