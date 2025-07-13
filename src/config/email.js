const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const sendVerificationEmail = async ({ email, verificationToken }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Verify your email for the app",
      html: `
            <h1>Welcome to the ClassRoom App</h1>
            <p>Click the link below to verify your email</p>
            <a href="${process.env.FRONTEND_URL}/setup-account/${verificationToken}">Verify email</a>
            <p>If you did not request this verification, please ignore this email.</p>
            `,
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  transporter,
  sendVerificationEmail,
};
