// db.js
const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.MONGODB_URI; // <-- make sure this is set in Render

if (!uri) {
  console.error("❌ Missing MONGODB_URI in environment");
  process.exit(1);
}

// Optional, quieter queries
mongoose.set("strictQuery", true);

// For Mongoose 7+, no need for useNewUrlParser/useUnifiedTopology
mongoose
  .connect(uri, {
    serverSelectionTimeoutMS: 10000, // fail fast if unreachable
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1); // let Render restart the service
  });

const db = mongoose.connection;

db.on("connected", () => console.log("ℹ️ Mongo server connection established"));
db.on("error", (err) => console.error("⚠️ Mongo server connection error:", err));
db.on("disconnected", () => console.warn("⚠️ Mongo disconnected"));

module.exports = db;
