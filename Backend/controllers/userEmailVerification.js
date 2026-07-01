const Userverification = require('../model/userVerification');
const bcrypt = require('bcrypt');
const User = require('../model/user');

const userEmailVerification = async (req, res) => {
    try {
        const { userId, uniqueString } = req.params;

        console.log("Verification attempt for user:", userId);

        const userRecord = await User.findById(userId);

        if (!userRecord) {
            const message = "User does not exist.";
            return res.redirect(`/user/verification/failed?error=true&message=${encodeURIComponent(message)}`);
        }

        // User already verified
        if (userRecord.verified) {
            return res.redirect("http://localhost:5173/email-verified");
        }

        // Find verification record
        const verificationRecord = await Userverification.findOne({ userId });

        // No verification record
        if (!verificationRecord) {

            await User.updateOne(
                { _id: userId },
                { verified: true }
            );

            return res.redirect("http://localhost:5173/email-verified");
        }

        const {
            expiresAt,
            uniqueString: hashedUniqueString
        } = verificationRecord;

        // Link expired
        if (new Date(expiresAt).getTime() < Date.now()) {

            await Userverification.deleteOne({ userId });

            await User.deleteOne({ _id: userId });

            const message = "Verification link has expired. Please sign up again.";

            return res.redirect(
                `/user/verification/failed?error=true&message=${encodeURIComponent(message)}`
            );
        }
        console.log("UUID From URL:", uniqueString);
console.log("Hashed UUID From DB:", hashedUniqueString);

        // Compare token
        const match = await bcrypt.compare(
            uniqueString,
            hashedUniqueString
        );

        if (!match) {

            const message = "Invalid verification link.";

            return res.redirect(
                `/user/verification/failed?error=true&message=${encodeURIComponent(message)}`
            );
        }

        // Verification Successful
        await User.updateOne(
            { _id: userId },
            { verified: true }
        );

        await Userverification.deleteOne({ userId });

        return res.redirect("http://localhost:5173/email-verified");

    } catch (error) {

        console.error(error);

        const message = "An error occurred during verification.";

        return res.redirect(
            `/user/verification/failed?error=true&message=${encodeURIComponent(message)}`
        );
    }
};

module.exports = { userEmailVerification };