const nodemailer = require("nodemailer");

let transporter = null
async function makeSMTPService() {

  transporter = nodemailer.createTransport({
    host: "hostde20.fornex.host",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "_mainaccount@m118751.hostde20.fornex.host", // generated ethereal user 
      pass: "Maksimka-87", // generated ethereal password
    },
  });



}

async function sendMail(titleFrom, to, title, text){
  try{
    let info = await transporter.sendMail({
      from: `${titleFrom}`, // sender address
      to: to, // list of receivers
      subject: title, // Subject line
      text: text, // plain text body
      html: `<b>${text}</b>`, // html body
    });
  }catch(err){
    console.log(err)
  }

}

module.exports = {
  makeSMTPService,
  sendMail,
};
