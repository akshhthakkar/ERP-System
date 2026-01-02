require("dotenv").config();
const nodemailer = require("nodemailer");

async function sendEmail(userEmail, subject, body, attachmentPath) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: subject,
    text: body,
  };

  if (attachmentPath) {
    mailOptions.attachments = [{ filename: "bill.pdf", path: attachmentPath }];
  }

  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
