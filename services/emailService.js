const nodemailer = require("nodemailer");
require("dotenv").config();

const sender = process.env.EMAIL;
const password = process.env.PASS;

const sendEmail = (email, token) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: sender,
      pass: password,
    },
  });

  var mailOptions = {
    from: sender,
    to: email,
    subject: "Password reset",
    html: `
        <p> You are requested for password reset</p>
        <h5>click to this <a href="http//localhost:3000/reset/${token}" >link </a>to reset password</h5>
        <p> This is only valid for 20 minutes`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent succesfully" + info.response);
    }
  });
};

module.exports = {
  sendEmail,
};
