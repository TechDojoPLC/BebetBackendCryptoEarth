const chatService = require("./chat.service");


function GetAll(req, res) {
    chatService
        .GetAll(req)
        .then((data) => res.status(200).json(data))
        .catch((err) => {
            res.status(400).json({ error: err.message });
        }); 
}
function GetAll(req, res) {
    chatService
        .GetAll(req)
        .then((data) => res.status(200).json(data))
        .catch((err) => {
            res.status(400).json({ error: err.message });
        }); 
}
function Create(req, res) {
    chatService
        .Create(req)
        .then((data) => res.status(200).json(data))
        .catch((err) => {
            res.status(400).json({ error: err.message });
        }); 
}
function GetAllMessagesByOrder(req, res) {
    //console.log("cw")
    const _id = req.params.id
    chatService
        .GetAllMessagesByOrder({_id:_id})
        .then((data) => res.status(200).json(data))
        .catch((err) => {
            res.status(400).json({ error: err.message });
        }); 
}

function Add(req, res) {
    const {text} = req.body
    const _id = req.params.id
    console.log(_id)
    chatService
        .Add(_id, text)
        .then((data) => res.status(200).json(data))
        .catch((err) => {
            res.status(400).json({ error: err.message });
        }); 
}
module.exports = {
    GetAll,
    Create,
    Add,
    GetAllMessagesByOrder,
};
