const userService = require("./admin.service");

function login(req,res){
  userService
    .login(req.body)
    .then((data) => res.status(200).json(data))
    .catch((err) =>{
      res.status(400).json({error:err.message});
    })
}

module.exports = {
  login,
};
