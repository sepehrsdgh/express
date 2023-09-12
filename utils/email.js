const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const { email, subject, message } = options;
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: 'sepehr dev <hello&sepehr.io>',
    to: email,
    subject,
    text: message,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
