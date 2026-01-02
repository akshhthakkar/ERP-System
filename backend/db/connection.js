require("dotenv").config();
const mongoose = require("mongoose");

mongoose.set("debug", process.env.NODE_ENV !== "production");

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/erpdb";

mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

module.exports = mongoose.connection;
