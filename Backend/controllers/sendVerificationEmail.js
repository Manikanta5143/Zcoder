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

        const verificationMailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: 'Verify Your Email Address to Complete Signup',
            html: `
                <p>Verify your email address to complete the signup process. This link expires in <b>1 hour</b>.</p>
                <p>Press <a href="${verificationLink}">here</a> to verify your email.</p>
            `,
        };

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
