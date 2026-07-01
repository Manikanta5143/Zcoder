const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const bcrypt = require('bcrypt');

const User = require('../model/user');
const UserVerification = require('../model/userVerification');

// controllers
const { userEmailVerification } = require('../controllers/userEmailVerification');
const userSignIn  = require('../controllers/userLogin');
const userSignUp = require('../controllers/userSignUp');
const sendVerificationEmail = require('../controllers/sendVerificationEmail');
const { resendVerificationEmail } = require('../controllers/resendVerificationEmail');

// path for static verified page, html page
const path = require('path');
const { log } = require('console');

// node mailer transporter
let transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.NODE_MAILER_PASS,
  },
});

// testing success
transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log('ready for messages');
    console.log(success);
  }
});

// ROUTES

// signup
router.post('/signup', async (req, res) => {
  try {
    await userSignUp(req, res);
    //console.log({req});
  } catch (error) {
    res.status(500).json({
      status: 'failedd',
      message: 'An error occurred during signup',
      error: error.message,
    });
  }
});

// email verification route
router.get('/verify/:userId/:uniqueString', async (req, res) => {
  try {
    await userEmailVerification(req, res);
  } catch (error) {
    res.status(500).json({
      status: 'failed',
      message: 'An error occurred during email verification',
      error: error.message,
    });
  }
});

// verified route
router.get('/verified', (req, res) => {
    try {
      res.sendFile(path.join(__dirname, '../views/verify.html'));
    } catch (error) {
      res.status(500).json({
        status: 'failed',
        message: 'An error occurred during verification',
        error: error.message,
      });
    }
  });

  // this is new function

// verification failed route
router.get('/verification/failed', (req, res) => {
    try {
      res.sendFile(path.join(__dirname, '../views/verificationFailed.html'));
    } catch (error) {
      res.status(500).json({
        status: 'failed',
        message: 'An error occurred during verification failure handling',
        error: error.message,
      });
    }
  });

// signin
router.post('/signin', async (req, res) => {
  try {
    await userSignIn(req, res);
  } catch (error) {
    res.status(500).json({
      status: 'failed',
      message: 'An error occurred during signin',
      error: error.message,
    });
  }
});

// Test endpoint to check user verification status
router.get('/test-user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ 
      $or: [{ username }, { email: username }] 
    });
    
    if (!user) {
      return res.json({
        found: false,
        message: 'User not found'
      });
    }
    
    return res.json({
      found: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        verified: user.verified
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'failed',
      message: 'An error occurred while testing user',
      error: error.message,
    });
  }
});
// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    await resendVerificationEmail(req, res);
  } catch (error) {
    console.error("Resend Verification Route Error:", error);

    res.status(500).json({
      success: false,
      message: "An error occurred while resending the verification email.",
      error: error.message,
    });
  }
});

module.exports = router;
