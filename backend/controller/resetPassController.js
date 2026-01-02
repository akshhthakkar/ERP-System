const User = require("../models/user");
const Token = require("../models/tokenModel");
const { sendPasswordResetEmail } = require("../utils/emailUtils");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const bcryptSalt = 10;

exports.resetPassword = async (req, res) => {
  const { token, id, newPassword } = req.body;

  // Validate input
  if (!token || !id || !newPassword) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Find the user by id
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the token associated with the user
    const tokenDoc = await Token.findOne({ userId: id });
    if (!tokenDoc) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Check token expiration (if implemented)
    if (tokenDoc.expiresAt < Date.now()) {
      return res.status(400).json({ message: "Token expired" });
    }

    // Compare the reset token with the one stored in the database
    const isValidToken = await bcrypt.compare(token, tokenDoc.token);
    if (!isValidToken) {
      return res.status(400).json({ message: "Invalid token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, bcryptSalt);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    // Delete the token from the database
    await tokenDoc.deleteOne();

    return res
      .status(200)
      .json({
        message:
          " Password is reset succesfull, ...redirecting you to the login page",
      });
  } catch (error) {
    console.error(error);
    // Provide more specific error messages based on the error type
    return res.status(500).json({ message: "An error occurred" });
  }
};
