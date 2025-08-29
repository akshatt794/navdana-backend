const express = require("express");
const router = express.Router();
// const {doubleSubmit} = require("../middleware/doublesubmit.js");
const {
    getAllBanners,
    addBanner,
    getBanner,
    updateBanner,
    deleteBanner
} = require("../controllers/bannercontroller.js");

const { verifyJWT } = require("../middleware/jwtauthMiddleware.js");
const multerUpload = require("../middleware/multerUpload.js");
router.post(
    "/banner",
    verifyJWT,
    multerUpload.fields([
        { name: "icon", maxCount: 1 },
        { name: "image", maxCount: 1 },
    ]),
    addBanner
);

router.get("/banner", getAllBanners);

router.get("/banner/:id", verifyJWT, getBanner);

router.put(
    "/banner/:id",
    verifyJWT, 
    multerUpload.fields([
        { name: "icon", maxCount: 1 },
        { name: "image", maxCount: 1 },
    ]),
    updateBanner
);

router.delete("/banner/:id", verifyJWT, deleteBanner);

module.exports = router;
