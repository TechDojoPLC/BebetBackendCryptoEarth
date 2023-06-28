const transactionService = require("./out_ref_transaction.service");


function getAllRequests(req, res) {
    transactionService
        .getAllRequests(req)
        .then((data) => res.status(200).json(data))
        .catch((err) => {
            res.status(400).json({ error: err.message });
        }); 
}

function requestOut(req, res) {
    transactionService
        .requestOut(req)
        .then((data) => res.status(200).json(data))
        .catch((err) => {
            res.status(400).json({ error: err.message });
        }); 
}

module.exports = {
    getAllRequests,
    requestOut,
};
