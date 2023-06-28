const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = require("../user/user.model");

const { userTypes } = require("../user/user.constants");

const SuperAdminSchema = new Schema({
    
});

module.exports = User.discriminator(userTypes.super_admin, SuperAdminSchema);
