const { codeSize } = require("./confirmation.constants");

const { Confirmation, User } = require("../../utils/dbs");
const { generateCode } = require("../../utils/confirmation");
const { messages } = require("../../utils/localization");
const { sendMail } = require("../../utils/sendSMTP");
const bcrypt = require("bcrypt")

async function getConfirmation(filter) {
  const confirmation = await Confirmation.findOne(filter).lean();

  return confirmation;
}
async function deleteConfirmation(field, value) {
  const deletedConfirmation = await Confirmation.findOneAndRemove({
    [field]: value,
  });

  return deletedConfirmation;
}

async function createConfirmationEmail(email) {
  const code = generateCode(codeSize);

  const newConfirmationDoc = await Confirmation.findOneAndUpdate(
    { email },
    {
      email,
      code,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const newConfirmationObj = newConfirmationDoc.toObject();

  return newConfirmationObj;
}

async function sendSubmitActionCodeToEmail(email) {
  const user = await User.exists({ email });

  if (!user) {

    throw new Error(messages.ERRORS.USER.USER_DOES_NOT_EXIST);
  }

  try {
    const confirmation = await createConfirmationEmail(email);
    sendMail("Подтверждение", email, "Ваш код для подтверждения", confirmation.code)
    /*
    await sendMessageToEmail(
      email,
      "Регистрация в Sportix",
      `Подтвердите email для регистрации, ваш код ${confirmation.code}`
    );
    */

    return { message: messages.OTHER.AUTH.CHECK_YOUR_CODE };
  } catch (error) {
    return error;
  }
}
async function sendCodeEmail(email) {
  const user = await User.exists({ email });

  if (!user) {
    throw new Error(messages.ERRORS.USER.USER_DOES_NOT_EXIST);
  }

  try {
    const confirmation = await createConfirmationEmail(email);
    sendMail("Sanil2045@yandex.ru", email, "Ваш код для подтверждения", confirmation.code)

    return { message: messages.OTHER.AUTH.CHECK_YOUR_CODE };
  } catch (error) {
    return error;
  }
}

async function checkConfirmation(data){
  const {code} = data
  const confirm = await getConfirmation({code:code})
  if (!confirm){
    throw new Error(messages.ERRORS.AUTH.CONFIRMATION_DOES_NOT_EXIST);
  }
  await deleteConfirmation("code", code)
  return true;
}


async function checkConfirmationAndSetPassword(data){
  const {code, password} = data
  if (password == null){
    throw new Error(messages.ERRORS.USER.PASSWORD_MUST_HAS_MORE_THEN_8_CHARACTERS)
  }
  const confirm = await getConfirmation({code:code})
  if (!confirm){
    throw new Error(messages.ERRORS.AUTH.CONFIRMATION_DOES_NOT_EXIST);
  }
  const usr = await User.findOne({email: confirm.email})
  const salt = await bcrypt.genSalt(Number(process.env.saltRounds));
  let enc = await bcrypt.hash(password, salt);
  usr.password = enc;

  await usr.save();
  await deleteConfirmation("code", code)

  return true;
}

module.exports = {
  checkConfirmation,
  sendCodeEmail,
  getConfirmation,
  deleteConfirmation,
  createConfirmationEmail,
  checkConfirmationAndSetPassword,
  sendSubmitActionCodeToEmail,
};
