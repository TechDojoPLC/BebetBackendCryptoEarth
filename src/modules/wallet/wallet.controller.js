const walletService = require("./wallet.service");

function Create(req,res){
  walletService
    .Create(req)
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((err) =>{
      res.status(400).json({error:err.message});
    })
}

function getMainWallet(req,res){
  walletService
    .getMainWallet(req)
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((err) =>{
      res.status(400).json({error:err.message});
    })
}
function GetAll(req,res){
  walletService
    .GetAll(req)
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((err) =>{
      res.status(400).json({error:err.message});
    })
}
module.exports = {
    Create,
    GetAll,
    getMainWallet,
};
