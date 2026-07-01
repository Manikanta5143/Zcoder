const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const UserVerification = require('../model/userVerification');
const nodemailer = require('nodemailer');
const user = require('../model/user');


// node mailer transporter
let transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.NODE_MAILER_PASS
    }
});

const sendVerificationEmail = async ({ _id, email }) => {
    try {
        // Use environment variable for base URL, fallback to localhost for dev
        const currentUrl = process.env.VERIFICATION_BASE_URL || 'http://localhost:8008/'; // Set VERIFICATION_BASE_URL in .env for production
        const uniqueString = uuidv4();
        const verificationLink = `${currentUrl}user/verify/${_id}/${uniqueString}`;
        
const verificationMailOptions = { from: process.env.AUTH_EMAIL, to: email, subject: "Verify Your Email Address to Complete Signup", html: ` <!DOCTYPE html> <html> <head> <meta charset="UTF-8"> <title>Email Verification</title> </head> <body style=" margin:0; padding:40px 20px; background:#eef3fb; font-family:'Segoe UI',Arial,sans-serif; "> <div style=" max-width:650px; margin:auto; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 15px 40px rgba(0,0,0,.12); "> <!-- HEADER --> <div style=" background:linear-gradient(135deg,#2563eb,#1d4ed8); padding:45px; text-align:center; "> <h1 style=" color:white; margin:0; font-size:34px; "> Welcome to 𝐙Coder 🚀 </h1> <p style=" color:#dbeafe; margin-top:14px; font-size:17px; "> Learn • Practice • Compete </p> </div> <!-- BODY --> <div style=" padding:45px; color:#334155; "> <h2 style=" margin-top:0; color:#0f172a; "> Verify Your Email </h2> <p style=" font-size:16px; line-height:1.9; "> Thank you for joining <strong>ZCoder</strong>. </p> <p style=" font-size:16px; line-height:1.9; "> Before you can access coding challenges, contests, submissions and community features, please verify your email address. </p> <div style=" text-align:center; margin:45px 0; "> <a href="${verificationLink}" style=" display:inline-block; background:#2563eb; color:white; text-decoration:none; padding:16px 38px; border-radius:12px; font-size:17px; font-weight:600; " > Verify Email </a> </div> <div style=" background:#eff6ff; border-left:5px solid #2563eb; padding:20px; border-radius:12px; "> <strong style="color:#2563eb;"> ⏳ Link Expiration </strong> <p style=" margin-top:10px; line-height:1.8; "> This verification link will expire in <strong>1 hour</strong>. If it expires, you can request another verification email. </p> </div> <p style=" margin-top:35px; line-height:1.8; color:#64748b; "> If you didn't create a ZCoder account, you can safely ignore this email. </p> </div> <!-- FOOTER --> <div style=" background:#0f172a; text-align:center; padding:25px; "> <p style=" color:#cbd5e1; margin:0; font-size:14px; "> © 2026 ZCoder </p> <p style=" color:#94a3b8; margin-top:8px; font-size:13px; "> Learn • Practice • Compete </p> </div> </div> </body> </html> ` };


        // Hash the unique string
        const saltRounds = 10;
        const hashedUniqueString = await bcrypt.hash(uniqueString, saltRounds);

        // Create a new user verification record
        const newVerification = new UserVerification({
            userId: _id,
            uniqueString: hashedUniqueString,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000 // 1 hour
        });

        await newVerification.save();

        // Send the verification email
        await transporter.sendMail(verificationMailOptions);

        // No res.json here for success
        // const data = await user.find({ email });
        // if (data.length === 0) {
        //     return res.json({
        //         status: "Failed",
        //         message: "Invalid credentials supplied."
        //     });
        // }

    } catch (error) {
        console.error(error);
        // Only use res if provided for error handling (optional)
        // if (res) {
        //   res.json({
        //     status: "Failed",
        //     message: "An error occurred during the email verification process."
        //   });
        // }
    }
};

module.exports = sendVerificationEmail;
