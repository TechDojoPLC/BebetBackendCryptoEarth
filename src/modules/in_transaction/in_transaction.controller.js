const transactionService = require("./in_transaction.service");



function createPaymentUrl(req, res) {
    transactionService
        .createPaymentUrl(req)
        .then((data) => res.status(200).json(data))
        .catch((err) => {
            res.status(400).json({ error: err.message });
        }); 
}

function Callback(req,res){
    transactionService
    .Callback(req)
    .then((data) => res.status(200))
    .catch((err) => {
        res.status(400)
    }); 
}
function CallbackCancel(req,res){
    transactionService
    .CallbackCancel(req)
    .then((data) => res.status(200))
    .catch((err) => {
        res.status(400)
    }); 
}

module.exports = {
    createPaymentUrl,
    Callback,
    CallbackCancel
};
