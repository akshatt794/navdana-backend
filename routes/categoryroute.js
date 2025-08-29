const express = require("express");
const router = express.Router();
// const {doubleSubmit} = require("../middleware/doublesubmit.js");
const {
    getAllCategories,
    addCategory,
    getCategory,
    updateCategory,
    deleteCategory
} = require("../controllers/categorycontroller.js");

const { verifyJWT } = require("../middleware/jwtauthMiddleware.js");
const multerUpload = require("../middleware/multerUpload.js");
router.post(
    "/categories",
    verifyJWT,
    multerUpload.fields([
        { name: "icon", maxCount: 1 },
        { name: "image", maxCount: 1 },
    ]),
    addCategory
);

router.get("/categories", getAllCategories);

router.get("/categories/:id", getCategory);

router.put(
    "/categories/:id",
    verifyJWT, 
    multerUpload.fields([
        { name: "icon", maxCount: 1 },
        { name: "image", maxCount: 1 },
    ]),
    updateCategory
);

router.delete("/categories/:id", verifyJWT, deleteCategory);

module.exports = router;
