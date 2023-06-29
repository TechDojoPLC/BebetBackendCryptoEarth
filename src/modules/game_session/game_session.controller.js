const gameSessionService = require("./game_session.service");


function Create(req, res) {
  gameSessionService
    .Create(req)
    .then((data) => res.status(200).json(data))
    .catch((err) => {
      res.status(400).json({ error: err.message });
    });
}

const GetAll = async (req,res) => {
  const {count} = req.params;
  console.log(count)
  gameSessionService
   .GetAll({count: count})
   .then((data) => res.status(200).json(data))
   .catch((err) => {
     res.status(400).json({ error: err.message });
   });
}
const GetAllWithCount = async (req,res) => {
  const {count} = req.params;
  //console.log(count)
  gameSessionService
   .GetAll({count: count})
   .then((data) => res.status(200).json(data))
   .catch((err) => {
     res.status(400).json({ error: err.message });
   });
}
const Update = async (req,res) => {
  gameSessionService
   .Update(req)
   .then((data) => res.status(200).json(data))
   .catch((err) => {
     res.status(400).json({ error: err.message });
   });
}
const SetCompleted = async (req,res) => {
  gameSessionService
   .SetCompleted(req)
   .then((data) => res.status(200).json(data))
   .catch((err) => {
     res.status(400).json({ error: err.message });
   });
}
const Delete = async (req,res) => {
  gameSessionService
   .Delete(req)
   .then((data) => res.status(200).json(data))
   .catch((err) => {
     res.status(400).json({ error: err.message });
   });
}
module.exports = {
  Create,
  //Admin controllers
  GetAll,
  Update,
  SetCompleted,
  Delete,
  GetAllWithCount,
};
