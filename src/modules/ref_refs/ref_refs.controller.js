const refRefsService = require("./ref_refs.service");

function Create(req,res){
  refRefsService
    .Create(req)
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((err) =>{
      res.status(400).json({error:err.message});
    })
}

function GetAll(req,res){
  refRefsService
    .GetAll(req)
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((err) =>{
      res.status(400).json({error:err.message});
    })
}
function GetByCurrentUser(req,res){
  refRefsService
    .GetByCurrentUser(req)
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((err) =>{
      res.status(400).json({error:err.message});
    })
}
function CatchTraffic(req,res){
  refRefsService
    .CatchTraffic(req)
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
    GetByCurrentUser,
    CatchTraffic,
};
