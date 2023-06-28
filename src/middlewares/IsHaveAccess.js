const { messages } = require("../utils/localization");
const { User, Auth } = require("../utils/dbs");
const IsHaveAccess = async (req, res, next) => {
  if (req.token) {
    const token = req.token;

    const auth = await Auth.findOne({jwtToken: token});

    const user = await User.findOne({user: auth.user})
    if (!user){
      throw Error("Token not valid")
    }
    if (!req.user) {
      return res.status(401).json({
        error: messages.ERRORS.AUTH.UNAUTHORIZED,
      });
    }

    res.cookie("user", req.user._id);

    return next();
  } else {
    return next();
  }
};

module.exports = IsHaveAccess;
