const User = require("../model/user");
const UserVerification = require("../model/userVerification");
const sendVerificationEmail = require("./sendVerificationEmail");

const resendVerificationEmail = async (req, res) => {
    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required."
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        if (user.verified) {
            return res.status(400).json({
                success: false,
                message: "User is already verified."
            });
        }

        // Delete old verification records
        await UserVerification.deleteMany({
            userId: user._id
        });

        // Send new verification email
        await sendVerificationEmail({
            _id: user._id,
            email: user.email
        });

        return res.status(200).json({
    success: true,
    email: user.email,
    message: "Verification email sent successfully. Please check your inbox."
});

    } catch (error) {

        console.error("Resend Verification Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to resend verification email."
        });

    }
};

module.exports = { resendVerificationEmail };