require("dotenv").config();
const nodemailer = require("nodemailer");

// Create a Nodemailer transporter using environment variables
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send a password reset email
async function sendPasswordResetEmail(email, resetLink) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <h2 style="color: #007bff;">Password Reset Request</h2>
          <p style="color: #333;">You requested for a password reset.</p>
          <p style="color: #333;">Click the button below to reset your password:</p>
          <p style="text-align: center;">
            <a href="${resetLink}" style="background-color: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </p>
          <p style="color: #333;">If you didn't request this reset, you can ignore this email.</p>
        </div>
      `,
    });
    console.log("Password reset email sent successfully");
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}

module.exports = { sendPasswordResetEmail };
