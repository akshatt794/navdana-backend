const { loginAuth, registerUser, forgotPwd } = require("../controllers/logincontroller");

const express = require("express");
const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginAuth);

router.post("/forgot-password", forgotPwd);

// router.post("/verify-user", verifyOTP);

// router.put("/create-password", createNewPwd);

// router.put('/update/:id', updateUser);

// router.post("/changePassword", verifyOTP);

module.exports = router;