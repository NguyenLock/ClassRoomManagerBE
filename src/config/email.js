const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const accessCodeTransporter = nodemailer.createTransport({
  service: "gmail",
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2563eb; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Welcome to ClassRoom App</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              Thank you for joining our platform! To get started, please verify your email address.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${
                process.env.FRONTEND_URL
              }/account-setup/${verificationToken}" 
                style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Verify Email
              </a>
            </div>
            <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
              This link will expire in 24 hours. If you did not request this verification, please ignore this email.
            </p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
              <p style="font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} ClassRoom App. All rights reserved.
              </p>
            </div>
          </div>
        </div>
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
  accessCodeTransporter,
  sendVerificationEmail,
};
