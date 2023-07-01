const gameSessionService = require("./settings.service");


const Get = async (req,res) => {
  gameSessionService
   .Get()
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


module.exports = {
  Get,
  Update,
};
