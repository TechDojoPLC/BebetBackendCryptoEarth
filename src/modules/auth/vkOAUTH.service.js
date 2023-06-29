const request = require("request");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  Types: { ObjectId },
} = require("mongoose");

const { Auth, User} = require("../../utils/dbs");
const { sendMessageToEmail } = require("../../utils/sendGrid");
const { messages } = require("../../utils/localization");

const {
  server: { fullBaseUrl, clientUrl },
} = require("../../config");
const localization = require("../../localizations/en.json");
const { Registrate, RegistrateViaVk } = require("../user/user.service");
const { generateJWT } = require("../../utils/auth/generateJWT");

const vkCallback = (req,res) => {
  
  //console.log(req.body)
}

function C_vkAuthorizer(req,res){
    vkAuthorizer(req)
    .then((data) => {
      //console.log(data)
      res.status(200).json(data)
    })
    .catch((err) =>{
      res.status(400).json({error:err.message});
    })
}

const vkAuthorizer = async (req) => {
  try{
    const {access_token, user_ids_vk} = req.body;
    if (!access_token){
      throw new Error("")
    }
    let getUserData = await fetch(`https://api.vk.com/method/users.get?user_ids=${user_ids_vk}&fields=bdate,email&access_token=${access_token}&v=5.131`)
    let resJson = await getUserData.json();
    //console.log(resJson.response)
    if (resJson){
      if (resJson.response)
        if (resJson.response.length != 0){
          let userFound = await User.findOne({vk_id: String(resJson.response[0].id)})
          if (!userFound){
            let usr = await RegistrateViaVk({vk_id: String(resJson.response[0].id)})
            const userTokenData = {
              id: usr._id.toString(),
            };
          
            const token = generateJWT(userTokenData, process.env.JWT_SECRET, process.env.SECRET_TOKEN_LIFE);
            let authNew = await Auth.create({user: usr._id, token: token} )
            return authNew.token
          }
          else{
            let userAuth = await Auth.findOne({user: userFound._id})
            if (userAuth){
              return userAuth.token
            }else{
              const userTokenData = {
                id: userFound._id.toString(),
              };
            
              const token = generateJWT(userTokenData, process.env.JWT_SECRET, process.env.SECRET_TOKEN_LIFE);
              let authNew = await Auth.create({user: userFound._id, token: token} )
              return authNew.token
            }
          }
        }
    }
    throw new Error("")
  }catch(e){
    console.log(e)
  }

}

module.exports = {
  vkCallback,
  vkAuthorizer,
  C_vkAuthorizer,
};
