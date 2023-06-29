const { User} = require("../utils/dbs");
async function findUser(data,replier, wsClient, callback){
    const {email, password} = data
    //console.log(email + " " + password)
    if (email != null && password != null){
        const usr = await User.findOne({email: email, password: password});
        if (!usr){
            replier(JSON.stringify({
                type: "error",
                message: "No user found!",
            }), wsClient);
            wsClient.userData = null;
        }
        else{
            replier(JSON.stringify({type: "reply", message: "" + usr._doc._id}), wsClient);
            wsClient.userData = usr._doc;
        }
    }else{
        replier(JSON.stringify({
            type: "error",
            message: "No user found!",
        }), wsClient);
        wsClient.userData = null;
    }
    if (callback != null) callback
}

module.exports = findUser;
