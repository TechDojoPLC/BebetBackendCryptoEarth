const userService = require("./ref_user.service");

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

function getDashboard(req,res){
  userService
    .getDashboard(req)
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((err) =>{
      res.status(400).json({error:err.message});
    })
}
function getAllReferent(req,res){
  userService
    .getAllReferent(req)
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
function getDashboardByDate(req,res){
  userService
    .getDashboardByDate(req)
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
  getAllReferent,
  getDashboard,
  getDashboardByDate
};
