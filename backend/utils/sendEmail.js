const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,         // 👈 Gmail address from .env
        pass: process.env.EMAIL_PASS,         // 👈 Gmail App Password (not normal password)
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log("📨 Email sent to", to);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
  }
};

module.exports = sendEmail;
