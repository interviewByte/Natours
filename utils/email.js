const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  console.log(process.env.EMAIL_HOST);
  // 1) Create a transporter (is actually a server to send email like: Ex: Gmail)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Activate in gmail "less secure app" option
  });
  // 2) Define the email options
  const mailOptions = {
    from: 'Jhon Doe <hello@example.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
