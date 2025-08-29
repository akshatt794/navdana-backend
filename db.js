const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URL = process.env.MONGODB_URL_LOCAL;

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected successfully"))
.catch((err) => console.error("MongoDB connection failed:", err));

const db = mongoose.connection;

db.on("connected", () => console.log("Mongo server connection established"));
db.on("error", (err) => console.log("Mongo server connection error: " + err));

module.exports = db;
