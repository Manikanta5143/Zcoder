const user = require('../model/user');
const Userverification = require('../model/userVerification');
const bcrypt = require('bcrypt');
const  sendVerificationEmail  = require('./sendVerificationEmail');

const userSignUp = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    username = username.trim();
    email = email.trim();
    password = password.trim();
    // dateOfBirth = dateOfBirth.trim();
    // console.log(username, email);

    // Check if any field is empty
    if (!username || !email || !password) {
      return res.json({
        status: "Failed",
        message: "Enter all input fields",
        entered : {
          "why" : username,
          username,
          email,
          password
        }
      });
    } else if (!/^[a-zA-Z\s]*$/.test(username)) { // Allow spaces in names
      return res.json({
        status: "Failed",
        message: "Invalid name entered"
      });
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      return res.json({
        status: "Failed",
        message: "Invalid email entered"
      });
    } else if (password.length < 8) {
      return res.json({
        status: "Failed",
        message: "Password is too short"
      });
    } else {
      // Check if user already exists
      const existingUser = await user.findOne({
    $or: [
        { username },
        { email }
    ]
});
      if (existingUser) {
        return res.json({
          status: "Failed",
          message: "Username or Email already exists"
        });
      } else {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new user({
          username,
          email,
          password:hashedPassword,
          verified: false
        });
        console.log('New user details before saving:', newUser);
        const result = await newUser.save();
        console.log('User saved:', result);
        // Send verification email (do not pass res for success)
        sendVerificationEmail(result).catch(err => {
          console.error('Verification email error:', err);
        });
        // Respond with a flat user object and status
        res.json({
          status: "Success",
          message: "Signup successful! Please check your email to verify your account."
        });
      }
    }
  } catch (err) {
    console.error(err);
    res.json({
      status: "Failed_end",
      message: "An error occurred during the sign-up process"
    });
  }
};

module.exports = userSignUp;
