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

// security & parsing
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// trust proxy if you use cookies
app.set('trust proxy', 1);

// CORS allowlist (Netlify + custom domain)
const allowlist = [
  process.env.REACT_ORIGIN,
  process.env.REACT_ORIGIN_2,
  process.env.REACT_ORIGIN_3,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => (!origin || allowlist.includes(origin) ? cb(null, true) : cb(new Error('CORS blocked: ' + origin))),
  credentials: true,
}));

// routes
app.use("/", loginroute);
app.use("/", categoryroute);
app.use("/", productroute);
app.use("/", bannerroute);

// root & health
app.get('/', (req, res) => res.json({ ok: true, service: 'navdana-backend', time: new Date().toISOString() }));
app.get('/health', (req, res) => res.json({ ok: true }));

// IMPORTANT: use Render's PORT
const PORT = process.env.PORT || process.env.LOCAL_PORT || 3000;
app.listen(PORT, () => console.log(`Node server running on port ${PORT}`));
