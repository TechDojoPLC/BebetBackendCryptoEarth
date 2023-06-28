const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const localization = require("../localization");
const { User, Auth, RefUser, RefAuth } = require("../dbs");
const { generateJWT } = require("./generateJWT");

const AttachUserByTokenOrUserData = async (req,res,next) => {
    try{
        if (req.body.email && req.body.password && req.body.email != "" && req.body.password != ""){
            let foundUserTest = await User.findOne({email: req.body.email})
            if (!foundUserTest){
                throw new Error(localization.messages.ERRORS.AUTH.WRONG_EMAIL_OR_PASSWORD);
            }
            if (foundUserTest.t)
            {
                throw new Error(localization.messages.ERRORS.AUTH.WRONG_EMAIL_OR_PASSWORD);
            }
            let isEqual = await bcrypt.compare(req.body.password, foundUserTest.password)
            console.log(req.body.password + " : " + foundUserTest.password + " : " + isEqual)
            
            if (isEqual){
                const userTokenData = {
                    id: foundUserTest._id.toString(),
                  };
                
                const token = generateJWT(userTokenData, process.env.JWT_SECRET, process.env.SECRET_TOKEN_LIFE);
                let authNew = await Auth.create({user: foundUserTest._id, token: token} )
                req.user = foundUserTest
                req.token = authNew.token
                next()
            }else{
                throw new Error(localization.messages.ERRORS.AUTH.WRONG_EMAIL_OR_PASSWORD);
            }
        }else{
            if (req.headers.authorization){
                let auth = await Auth.findOne({token: req.headers.authorization})
                if (!auth){
                    throw new Error(localization.messages.ERRORS.AUTH.INVALID_TOKEN)
                }
                let user = await User.findOne({_id: auth.user})
                if (!user){
                    throw new Error(localization.messages.ERRORS.USER.USER_DOES_NOT_EXIST)
                }
                if (user.t)
                {
                    throw new Error(localization.messages.ERRORS.AUTH.WRONG_EMAIL_OR_PASSWORD);
                }
                req.user = user
                next()
            }
            else{
                throw new Error(localization.messages.ERRORS.AUTH.INVALID_TOKEN)
            }
        }
    }catch(e){
        console.log(e)
        res.status(401).send(JSON.stringify({error: e}))
    }

}
const AttachRefUserByTokenOrUserData = async (req,res,next) => {
    try{
        if (req.body.email && req.body.password && req.body.email != "" && req.body.password != ""){
            let foundUserTest = await RefUser.findOne({email: req.body.email})
            if (!foundUserTest){
                throw new Error(localization.messages.ERRORS.AUTH.WRONG_EMAIL_OR_PASSWORD);
            }
            let isEqual = await bcrypt.compare(req.body.password, foundUserTest.password)
            console.log(req.body.password + " : " + foundUserTest.password + " : " + isEqual)
            
            if (isEqual){
                const userTokenData = {
                    id: foundUserTest._id.toString(),
                  };
                
                const token = generateJWT(userTokenData, process.env.JWT_SECRET, process.env.SECRET_TOKEN_LIFE);
                let authNew = await RefAuth.create({user: foundUserTest._id, token: token} )
                req.user = foundUserTest
                req.token = authNew.token
                next()
            }else{
                throw new Error(localization.messages.ERRORS.AUTH.WRONG_EMAIL_OR_PASSWORD);
            }
        }else{
            if (req.headers.authorization){
                let auth = await RefAuth.findOne({token: req.headers.authorization})
                if (!auth){
                    throw new Error(localization.messages.ERRORS.AUTH.INVALID_TOKEN)
                }
                let user = await RefUser.findOne({_id: auth.user})
                if (!user){
                    throw new Error(localization.messages.ERRORS.USER.USER_DOES_NOT_EXIST)
                }
                req.user = user
                next()
            }
            else{
                throw new Error(localization.messages.ERRORS.AUTH.INVALID_TOKEN)
            }
        }
    }catch(e){
        console.log(e)
        res.status(401).send(JSON.stringify({error: e}))
    }

}
module.exports = {
    AttachUserByTokenOrUserData,
    AttachRefUserByTokenOrUserData,
}