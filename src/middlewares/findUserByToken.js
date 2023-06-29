const { User, Auth} = require("../utils/dbs");
async function findUserByToken(data,replier, wsClient, callback){
    const {token} = data
    if (token != null){
        const auth = await Auth.findOne({jwtToken: token});
        if (!auth){
            replier(JSON.stringify({
                type: "error",
                message: "No token found!",
            }), wsClient);
            wsClient.userData = null;
        }
        else{
            const usr = await User.findOne({_id: auth.user})
            if (!usr){
                replier(JSON.stringify({
                    type: "error",
                    message: "No user found!",
                }), wsClient);
                wsClient.userData = null;
            }
            else{
                const usr = await User.findOne({_id: auth.user})
                replier(JSON.stringify({type: "reply", message: "" + usr._doc._id}), wsClient);
                wsClient.userData = usr._doc;
                //console.log("User connected: " + usr._doc._id)
            }

        }
    }else{
        replier(JSON.stringify({
            type: "error",
            message: "No token provided!",
        }), wsClient);
        wsClient.userData = null;
    }
    if (callback != null) callback
}

module.exports = findUserByToken;
