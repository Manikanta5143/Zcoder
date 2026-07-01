const path = require('path');

const userVerified = (req, res) => {
    try {
        res.redirect("http://localhost:5173/email-verified");
    } catch (error) {
        res.status(500).json({
            status: 'failed',
            message: 'An error occurred while serving the verification success page',
            error: error.message,
        });
    }
};
module.exports = { userVerified };


