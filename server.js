const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

require("dotenv").config();

require("./db.js");

const loginroute = require("./routes/loginroute.js");
const categoryroute = require("./routes/categoryroute.js");
const productroute = require("./routes/productroute.js");
const bannerroute = require("./routes/bannerroute.js");

const app = express();

//Security middleware
app.use(helmet()); // sets secure HTTP headers to mitigate XSS, clickjacking, MIME sniffing, etc.

// Middleware for parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: process.env.REACT_ORIGIN, // React app URL
  credentials: true,                // allow cookies
}));


//Routes
app.use("/", loginroute);
app.use("/", categoryroute);
app.use("/", productroute);
app.use("/", bannerroute);

const PORT = process.env.LOCAL_PORT || 3000;

app.listen(PORT, () => {
  console.log(`Node server running on port ${PORT}`);
});