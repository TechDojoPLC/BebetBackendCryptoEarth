const userService = require("./user.service");

function Registrate(req,res){
  userService
    .Registrate(req.body)
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((err) =>{
      res.status(400).json({error:err.message});
    })
}


function ForgotPassword(req,res){
  userService
    .ForgotPassword(req)
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((err) =>{
      res.status(400).json({error:err.message});
    })
}
function RefConnect(req,res){
  userService
    .RefConnect(req)
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((err) =>{
      res.status(400).json({error:err.message});
    })
}

function updatePassword(req,res){
  userService
    .updatePassword(req)
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((err) =>{
      res.status(400).json({error:err.message});
    })
}
function updateData(req,res){
  userService
    .updateData(req)
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((err) =>{
      res.status(400).json({error:err.message});
    })
}

function GetCurrentUser(req, res) {

  return userService
    .GetCurrentUser(req)
    .then((data) => res.status(200).json(data))
    .catch((err) => {
      res.status(400).json({ error: err.message });
    });
}
function Authorize(req, res) {

  return userService
    .Authorize(req)
    .then((data) => res.status(200).json(data))
    .catch((err) => {
      res.status(400).json({ error: err.message });
    });
}
module.exports = {
  Registrate,
  Authorize,
  GetCurrentUser,
  updateData,
  updatePassword,
  RefConnect
};
