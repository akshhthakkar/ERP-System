require("dotenv").config();

module.exports = {
  secretKey: process.env.JWT_SECRET || "your-default-secret-key",
  port: process.env.PORT || 3000,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
};
