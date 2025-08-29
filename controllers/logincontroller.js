const { generateOtp, sendCodeByEmail } = require("../utils/verificationByOtp.js");
const User = require("../models/user.js");
const Otp = require("../models/Otp.js");
const { generateToken } = require("../middleware/jwtauthMiddleware.js");

// -------------------- LOGIN --------------------
const loginAuth = async (req, res) => {
    const { username, password } = req.body;
    console.log(req.body)
    const user = await User.findOne({ username });
    console.log(user);
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: "Invalid username or password" });
    }

    const payload = { id: user.id };
    const token = generateToken(payload);

    res.json({ message: "Login Successfully", status: true, token });
};

// -------------------- REGISTER --------------------
const registerUser = async (req, res) => {
    try {
        const user = new User(req.body);
        const responseUser = await user.save();
        res.status(200).json({ message: "User Register Successfully", status: true, response: responseUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// -------------------- FORGOT PASSWORD --------------------
const forgotPwd = async (req, res) => {
    const { username } = req.body;
    const userResponse = await User.findOne({ username });

    if (!userResponse) {
        return res.status(401).json({ error: "Invalid Username" });
    }

    const otp = generateOtp();

    // Save OTP in separate collection (auto-expire via TTL index)
    await Otp.create({ email: username, otp });

    // Send via email
    sendCodeByEmail(username, otp);

    res.status(200).json({ status: true, response: `OTP sent successfully to ${username}` });
};

// -------------------- VERIFY OTP --------------------
const verifyOTP = async (req, res) => {
    try {
        const { username, otp } = req.body;

        // find OTP
        const otpDoc = await Otp.findOne({ email: username, otp });
        if (!otpDoc) {
            return res.status(401).json({ error: "Invalid or expired OTP" });
        }

        // delete OTP after successful verification
        await Otp.deleteMany({ email: username });

        return res.status(200).json({ status: true, response: "OTP confirmed for " + username });
    } catch (err) {
        return res.status(500).json({ error: "Server error" });
    }
};

// -------------------- CREATE NEW PASSWORD --------------------
const createNewPwd = async (req, res) => {
    try {
        const { username, password, confirmpassword } = req.body;

        if (password !== confirmpassword) {
            return res.status(401).json({ error: "Passwords do not match" });
        }

        const userResponse = await User.findOne({ username });
        if (!userResponse) {
            return res.status(401).json({ error: "Invalid Username" });
        }

        const newUser = await User.findOneAndUpdate(
            { username },
            { password },
            { new: true }
        );

        return res.status(200).json({ status: true, response: newUser });
    } catch (err) {
        return res.status(500).json({ error: "Server error" });
    }
};

// -------------------- UPDATE USER --------------------
const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const updateData = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found", status: false });
        }

        res.status(200).json({ message: "User updated successfully", status: true, response: updatedUser });
    } catch (error) {
        res.status(500).json({ message: error.message, status: false });
    }
};

module.exports = { loginAuth, registerUser, forgotPwd, verifyOTP, createNewPwd, updateUser };
