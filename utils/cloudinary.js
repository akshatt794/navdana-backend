const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

dotenv.config(); 

cloudinary.config({
  cloud_name: "dqjvadenj",
  api_key: "413689578982953",
  api_secret: "nVC5qdg9syRjnLRtCL9khsx9BOo",
  secure: true
});

module.exports = cloudinary;
