const { addProduct, getAllProducts, getProduct, deleteProduct, updateProduct } = require("../controllers/productcontroller.js");

const express = require("express");
const router = express.Router();

const { verifyJWT } = require("../middleware/jwtauthMiddleware");

const upload = require("../middleware/multerUpload");

router.post("/products", verifyJWT, upload.fields([{ name: "images", maxCount: 5 }]), addProduct );

router.get("/products", getAllProducts);

router.get("/products/:id", getProduct);

router.put("/products/:id", verifyJWT, upload.fields([
    { name: "images", maxCount: 5 }
  ]), updateProduct);

router.delete("/products/:id", verifyJWT, deleteProduct);

module.exports = router;