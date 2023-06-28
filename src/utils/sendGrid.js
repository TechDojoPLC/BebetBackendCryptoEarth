const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

async function sendMessageToEmail(email, subject, text) {
  try {
    const msg = {
      to: email,
      from: process.env.EMAIL_FOR_SEND_MESSAGES,
      subject: subject || "От",
      text: text,
    };
    console.log(msg);
    const result = await sgMail.send(msg);

    return result;
  } catch (error) {
    return error;
  }
}

module.exports = {
  sendMessageToEmail,
};
