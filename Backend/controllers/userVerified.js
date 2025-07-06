const path = require('path');

const userVerified = (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '../views/verify.html'));
    } catch (error) {
        res.status(500).json({
            status: 'failed',
            message: 'An error occurred while serving the verification success page',
            error: error.message,
        });
    }
};

module.exports = { userVerified };
