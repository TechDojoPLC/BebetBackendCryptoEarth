const Joi = require("joi");

const { phoneNumberValidator } = require("../../utils/auth");

const { userTypes,userSex } = require("../user/user.constants");
const { regexForPassword } = require("./auth.constants");
const { messages } = require("../../utils/localization");

const phoneVerifyValidateSchema = Joi.object({
  phone: Joi.string()
    .custom((value, helper) => phoneNumberValidator(value, helper))
    .required(),
});

const emailVerifyValidateSchema = Joi.object({
  email: Joi.string().email({ allowUnicode: true }).required(),
});

const signInValidateSchema = Joi.object({
  email: Joi.string().email({ allowUnicode: true }).required(),
  code: Joi.string().required(),
  deviceId: Joi.string(),
});

const registrationValidateSchema = Joi.object({
  email: Joi.string().email({ allowUnicode: true }).required(),
  name: Joi.string().required(),
  last_name: Joi.string().required(),
  fcmToken: Joi.string(),
  type: Joi.string()
    .valid(...Object.keys(userTypes))
    .required(),
  sex: Joi.string()
  .valid(...Object.keys(userSex))
  .required(),
  createPassword: Joi.string().required().regex(regexForPassword).message(messages.ERRORS.AUTH.PASSWORD_MUST_BE),
  confirmPassword: Joi.string()
    .valid(Joi.ref("createPassword"))
    .messages({ "any.only": "Passwords should match" })
    .required(),
  tel: Joi.string().required(),
  description: Joi.string().required(),
  deviceId: Joi.string(),
});

const loginValidateSchema = Joi.object({
  email: Joi.string().email({ allowUnicode: true }).required(),
  fcmToken: Joi.string(),
  password: Joi.string().required().regex(regexForPassword).message(messages.ERRORS.AUTH.PASSWORD_MUST_BE),
  deviceId: Joi.string(),
});

const refreshTokenValidator = Joi.object({
  refreshToken: Joi.string().required(),
  fcmToken: Joi.string(),
  deviceId: Joi.string(),
});

const resetPasswordValidator = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().required().regex(regexForPassword).message(messages.ERRORS.AUTH.PASSWORD_MUST_BE),
  deviceId: Joi.string(),
});

const registrationModeratorValidateSchema = Joi.object({
  email: Joi.string().email({ allowUnicode: true }).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  fcmToken: Joi.string(),
  type: Joi.string()
    .valid(...Object.keys(userTypes))
    .required(),
  createPassword: Joi.string().required().regex(regexForPassword).message(messages.ERRORS.AUTH.PASSWORD_MUST_BE),
  confirmPassword: Joi.string()
    .valid(Joi.ref("createPassword"))
    .messages({ "any.only": "Passwords should match" })
    .required(),
  deviceId: Joi.string(),
});

const loginWithGoogleValidateSchema = Joi.object({
  tokenFromGoogle: Joi.string().not().empty().required(),
  role: Joi.string().valid(userTypes.patient, userTypes.doctor),
  fcmToken: Joi.string(),
  deviceId: Joi.string(),
});

const loginWithFacebookValidateSchema = Joi.object({
  userId: Joi.string().not().empty().required(),
  accessToken: Joi.string().not().empty().required(),
  role: Joi.string().valid(userTypes.patient, userTypes.doctor),
  fcmToken: Joi.string(),
  deviceId: Joi.string(),
});

module.exports = {
  phoneVerifyValidateSchema,
  signInValidateSchema,
  emailVerifyValidateSchema,
  registrationValidateSchema,
  loginValidateSchema,
  refreshTokenValidator,
  resetPasswordValidator,
  registrationModeratorValidateSchema,
  loginWithGoogleValidateSchema,
  loginWithFacebookValidateSchema,
};
