const otpGenerator = require("otp-generator");
const nodemailer = require('nodemailer');
const axios = require("axios");
require("dotenv").config();

const generateOtp = () => {
    // otp creation
    let otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
        digits: true
    }
    );

    return otp;
}

const sendCodeByEmail = (email, otp) => {

    var mailOptions = {
        from: process.env.ADMIN_EMAIL,
        to: email,
        subject: 'Suppkart 1 step verification',
        text: `Update your password, enter the 6 number verification code and then move to the next 
        screen ${otp}`
    };

    const transporter = nodemailer.createTransport({
        service: "gmail.com",
        auth: {
            user: process.env.ADMIN_EMAIL,
            pass: process.env.APP_PWD  // Make sure you're using an app password if 2FA is enabled
        }
    });

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            // console.log(error);
        } else {
            // console.log('Email sent: ' + info.response);
        }
    });
}

const sendOtpViaSMS = async (phone) => {
  try {
    const apiKey = process.env.FACTOR_API_KEY_ID;
    const url = `https://2factor.in/API/V1/${apiKey}/SMS/${phone}/AUTOGEN2/OTP1`;

    const response = await axios.get(url);
    const data = response.data;

    if (data.Status === "Success") {
      return {
        success: true,
        sessionId: data.Details,        
        otp: data.OTP || null           
      };
    } else {
      return {
        success: false,
        message: data.Details
      };
    }
  } catch (err) {
    return {
      success: false,
      message: err.message
    };
  }
};

module.exports = { sendCodeByEmail, generateOtp, sendOtpViaSMS };