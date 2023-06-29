const transactionService = require("./transaction.service");


function GetAllByUser(req, res) {
    transactionService
        .GetAllByUser(req)
        .then((data) => res.status(200).json(data))
        .catch((err) => {
            res.status(400).json({ error: err.message });
        }); 
}

module.exports = {
    GetAllByUser,
};
