const user = require('../model/user');
const bcrypt = require('bcrypt');

const userSignIn = async (req, res) => {
    let { username, password } = req.body;
    username = username.trim();
    password = password.trim();

    console.log('Login attempt for username:', username); // Debug log

    // Check for empty username or password
    if (!username || !password) {
        console.log('Empty credentials provided');
        return res.json({
            status: "Failed",
            message: "Empty credentials supplied."
        });
    }

    try {
        // Find by username OR email
        const data = await user.find({
            $or: [{ username }, { email: username }]
        });
        
        console.log('Found users:', data.length); // Debug log
        
        if (data.length === 0) {
            console.log('No user found with username/email:', username);
            return res.json({
                status: "Failed",
                message: "Invalid credentials supplied."
            });
        }

        // User exists
        const userData = data[0];
        console.log('User found:', { 
            _id: userData._id, 
            username: userData.username, 
            email: userData.email, 
            verified: userData.verified 
        }); // Debug log

        // Check if user is verified
        if (!userData.verified) {
    console.log("User not verified:", userData.username);

    return res.status(403).json({
        success: false,
        verified: false,
        email: userData.email,
        message: "Your email is not verified. Please verify your email first."
    });
}

        // Compare passwords
        const isMatch = await bcrypt.compare(password, userData.password);
        console.log('Password match:', isMatch); // Debug log
        
        if (isMatch) {
            // Return a flat user object
            const userResponse = {
                status: "Success",
                _id: userData._id,
                username: userData.username,
                email: userData.email,
                verified: userData.verified
            };
            console.log('Login successful, returning:', userResponse); // Debug log
            return res.json(userResponse);
        } else {
            console.log('Password mismatch for user:', userData.username);
            return res.json({
                status: "Failed",
                message: "Invalid password entered."
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.json({
            status: "Failed",
            message: "An error occurred during signin.",
            error: error.message
        });
    }
};

module.exports = userSignIn;
