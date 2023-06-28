/**
 *
 * @param {String | String[]} roles can be user type (roles from user's constants). example "SUPER_ADMIN" or ["SUPER_ADMIN", "BLOGGER"]
 */

 module.exports = function (roles) {
    return function (req, res, next) {
      const userType = req.user.role;
  
      if (!roles) {
        return next();
      }
  
      if (typeof roles === "string" && roles === userType) {
        return next();
      }
  
      if (Array.isArray(roles) && (!roles.length || roles.includes(userType))) {
        return next();
      }
  
      return res.status(403).json({
        error: "Forbidden",
      });
    };
  };