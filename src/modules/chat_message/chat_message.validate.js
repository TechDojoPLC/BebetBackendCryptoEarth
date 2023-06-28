const Joi = require("joi");

const { currencies } = require("../../constants/currencies");
const { OBJECT_ID_REGEX } = require("../../constants/regexp");
const { regexForPassword } = require("../auth/auth.constants");
const { messages } = require("../../utils/localization");

const userCreateValidateSchema = Joi.object({
  firstName: Joi.string().min(2).max(20).required(),
  lastName: Joi.string().min(2).max(20).required(),
  phone: Joi.string().min(5).max(14).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(24).required(),
  role: Joi.string()
    .required(),
});

const idValidator = Joi.object({
  id: Joi.string().pattern(OBJECT_ID_REGEX).message("Id is not valid").required(),
});

const bloggerCreateValidateSchema = userCreateValidateSchema.keys({
  instagramAccount: Joi.array(),
});

const advertiserCreateValidateSchema = userCreateValidateSchema.keys({
  currency: Joi.string().valid(...Object.keys(currencies)),
});

const userUpdateValidateSchema = Joi.object({
  email: Joi.string().email({ allowUnicode: true }),
  firstName: Joi.string().min(2).max(20),
  lastName: Joi.string().min(2).max(20),
  currentPassword: Joi.string().min(6).max(24),
  newPassword: Joi.string().regex(regexForPassword).message(messages.ERRORS.AUTH.PASSWORD_MUST_BE),
  confirmNewPassword: Joi.string().valid(Joi.ref("newPassword")).messages({ "any.only": "Passwords should match" }),
  emailSubscribed: Joi.boolean(),
});

const moderatorUpdateValidateSchema = Joi.object({
  firstName: Joi.string().min(2).max(20),
  lastName: Joi.string().min(2).max(20),
  phone: Joi.string().min(5).max(14),
  email: Joi.string().email(),
  newPassword: Joi.string().regex(regexForPassword).message(messages.ERRORS.AUTH.PASSWORD_MUST_BE),
  confirmNewPassword: Joi.string().valid(Joi.ref("newPassword")).messages({ "any.only": "Passwords should match" }),
});

module.exports = {
  userCreateValidateSchema,
  userUpdateValidateSchema,
  bloggerCreateValidateSchema,
  advertiserCreateValidateSchema,
  moderatorUpdateValidateSchema,
  idValidator,
};
