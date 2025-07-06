const Userverification = require('../model/userVerification');
const bcrypt = require('bcrypt');
const User = require('../model/user');
const { sendVerificationEmail } = require('./sendVerificationEmail');

const userEmailVerification = async (req, res) => {
    try {
        const { userId, uniqueString } = req.params;
        console.log('Verification attempt for userId:', userId); // Debug log
        
        const userRecord = await User.findById(userId);

        if (!userRecord) {
            console.log('User not found for verification:', userId);
            const message = "User does not exist.";
            return res.redirect(`/user/verification/failed?error=true&message=${message}`);
        }

        console.log('User found for verification:', { 
            _id: userRecord._id, 
            username: userRecord.username, 
            email: userRecord.email, 
            verified: userRecord.verified 
        }); // Debug log

        // Check if user is already verified
        if (userRecord.verified) {
            console.log('User already verified:', userRecord.username);
            return res.redirect(`/user/verified`);
        }

        // Check if user verification record exists
        const result = await Userverification.findOne({ userId });
        console.log('Verification record found:', !!result); // Debug log

        if (!result) {
            // If no verification record, but user exists, set verified anyway
            console.log('No verification record found, setting user as verified:', userRecord.username);
            await User.updateOne({ _id: userId }, { verified: true });
            return res.redirect(`/user/verified`);
        }

        const { expiresAt, uniqueString: hashedUniqueString } = result;
        const expiresAtTimestamp = new Date(expiresAt).getTime();
        const currentTimestamp = Date.now();

        console.log('Verification link expiry check:', { 
            expiresAt: new Date(expiresAt), 
            currentTime: new Date(currentTimestamp),
            isExpired: expiresAtTimestamp < currentTimestamp 
        }); // Debug log

        if (expiresAtTimestamp < currentTimestamp) {
            // Link is expired
            console.log('Verification link expired for user:', userRecord.username);
            await Userverification.deleteOne({ userId });
            await User.deleteOne({ _id: userId });
            const message = 'Link expired. Please sign up again.';
            return res.redirect(`/user/verification/failed?error=true&message=${message}`);
        }

        // Link is still valid, compare unique strings
        const match = await bcrypt.compare(uniqueString, hashedUniqueString);
        console.log('Unique string match:', match); // Debug log
        
        if (match) {
            // Strings match, update user verified status
            console.log('Verification successful for user:', userRecord.username);
            await User.updateOne({ _id: userId }, { verified: true });
            await Userverification.deleteOne({ userId });
            return res.redirect(`/user/verified`);
        } else {
            // Strings do not match
            console.log('Invalid verification link for user:', userRecord.username);
            const message = "Invalid verification link, please check your inbox.";
            return res.redirect(`/user/verification/failed?error=true&message=${message}`);
        }
    } catch (error) {
        console.error('Verification error:', error);
        const message = "An error occurred during the verification process.";
        return res.redirect(`/user/verification/failed?error=true&message=${message}`);
    }
};

module.exports = { userEmailVerification };
