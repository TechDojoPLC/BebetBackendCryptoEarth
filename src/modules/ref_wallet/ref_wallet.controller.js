const refWalletService = require("./ref_wallet.service");

function Create(req,res){
  refWalletService
    .Create(req)
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((err) =>{
      res.status(400).json({error:err.message});
    })
}

function getMainWallet(req,res){
  refWalletService
    .getMainWallet(req)
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((err) =>{
      res.status(400).json({error:err.message});
    })
}
function GetAll(req,res){
  refWalletService
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
