const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]); // Set DNS servers to Google and Cloudflare

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI?.trim();
    if (!mongoUri) {
      throw new Error("MONGO_URI is missing. Set it in server/.env.");
    }
    if (
      mongoUri.includes("<db_password>") ||
      mongoUri.includes("db_password")
    ) {
      throw new Error(
        "MONGO_URI still contains the <db_password> placeholder. Replace it with the Atlas database user password in server/.env.",
      );
    }

    const DB = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${DB.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
