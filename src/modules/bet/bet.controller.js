const betService = require("./bet.service");


function Create(req, res) {
  betService
    .Create(req)
    .then((data) => res.status(200).json(data))
    .catch((err) => {
      res.status(400).json({ error: err.message });
    });
}

const GetAll = async (req,res) => {
  betService
   .GetAll(req)
   .then((data) => res.status(200).json(data))
   .catch((err) => {
     res.status(400).json({ error: err.message });
   });
}
const GetAllWithCount = async (req,res) => {
  const {count} = req.params;
  betService
   .GetAllWithCount({count: count})
   .then((data) => res.status(200).json(data))
   .catch((err) => {
     res.status(400).json({ error: err.message });
   });
}
const GetAllByUserId = async (req,res) => {
  betService
   .GetAllByUserId(req)
   .then((data) => res.status(200).json(data))
   .catch((err) => {
     res.status(400).json({ error: err.message });
   });
}
const GetAllByUserIdCount = async (req,res) => {
  const {count} = req.params
  betService
   .GetAllByUserIdCount(req, count)
   .then((data) => res.status(200).json(data))
   .catch((err) => {
     res.status(400).json({ error: err.message });
   });
}
const Update = async (req,res) => {
  betService
   .Update(req)
   .then((data) => res.status(200).json(data))
   .catch((err) => {
     res.status(400).json({ error: err.message });
   });
}
const SetCompleted = async (req,res) => {
  betService
   .SetCompleted(req)
   .then((data) => res.status(200).json(data))
   .catch((err) => {
     res.status(400).json({ error: err.message });
   });
}
const Delete = async (req,res) => {
  betService
   .Delete(req)
   .then((data) => res.status(200).json(data))
   .catch((err) => {
     res.status(400).json({ error: err.message });
   });
}
const GetAllByCurrentGame = async (req,res) => {
  betService
   .GetAllByCurrentGame()
   .then((data) => res.status(200).json(data))
   .catch((err) => {
     res.status(400).json({ error: err.message });
   });
}
module.exports = {
  Create,
  GetAllByUserId,
  //Admin controllers
  GetAll,
  Update,
  SetCompleted,
  Delete,
  GetAllWithCount,
  GetAllByUserIdCount,
  GetAllByCurrentGame,
};
