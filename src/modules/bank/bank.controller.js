const bankService = require("./bank.service");

function Create(req,res){
  bankService
    .Create(req)
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((err) =>{
      res.status(400).json({error:err.message});
    })
}

function getMainWallet(req,res){
  bankService
    .getMainWallet(req)
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((err) =>{
      res.status(400).json({error:err.message});
    })
}
function GetAll(req,res){
  bankService
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
