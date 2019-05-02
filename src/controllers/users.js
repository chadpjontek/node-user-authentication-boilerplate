const User = require('../models/user');
const { sendEmailVerification, sendPasswordRecoveryEmail, createHash, updatePassword, signToken } = require('../helpers/controllerHelpers');
const { generateNonce } = require('../helpers');

/**
 * User sign up logic
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 */
const signUp = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    // Check if there is a user with the same email
    const foundUser = await User.findOne({ email });
    if (foundUser) {
      return res.status(403).json({ error: 'Email is already in use' });
    }
    // Check if there is a user with the same username
    const dupName = await User.findOne({ username });
    if (dupName) {
      return res.status(403).json({ error: 'Username is already taken' });
    }
    // Create a new user
    const newUser = new User({ email, password, username });
    await newUser.save();
    // Send email verification
    sendEmailVerification(email, username, newUser.verificationCode.value);
    // Respond with success message
    res.status(200).json({ message: 'Your account has been created. Please verify it by clicking the activation link that has been sent to your email.' });
  } catch (error) {
    console.log(error);
  }
};

/**
 * Email verification logic
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 */
const verify = async (req, res) => {
  try {
    const { username, code } = req.params;
    // Check if there is an account with this username
    const foundUser = await User.findOne({ username });
    if (!foundUser) {
      return res.status(404).json({ error: 'There is no account associated with this username.' });
    }
    // Check if the account is already verified
    if (foundUser.isVerified) {
      return res.status(200).json({ message: 'This account has already been verified. You can log in now.' });
    }
    // Check if the verification code matches the activation hash
    const isMatch = await foundUser.isVerifiedEmail(code);
    // If not, handle it
    if (!isMatch) {
      return res.status(401).json({ error: 'The verification code does not match.' });
    };
    // If verification code is older than 3 hours, reject with reason
    const currentTime = Date.now();
    const codeAge = foundUser.verificationCode.createdAt;
    if ((currentTime - codeAge) > (1000 * 60 * 60 * 3)) {
      // Create new code and resend
      const verificationCode = generateNonce(16);
      foundUser.verificationCode.value = verificationCode;
      foundUser.activationHash = await createHash(verificationCode);
      await foundUser.save();
      await sendEmailVerification(foundUser.email, username, foundUser.verificationCode.value);
      return res.status(401).json({ error: 'The verification code has expired. A new code has been sent to your email.' });
    }
    // Update user as being verified and delete codes
    foundUser.isVerified = true;
    foundUser.verificationCode = { value: null, createdAt: null };
    foundUser.activationHash = null;
    await foundUser.save();
    // Respond with verification success message
    res.status(200).json({ message: 'Your account has been verified. You can now log in.' });
  } catch (error) {
    console.log(error);
  }
};

/**
 * User sign in logic
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 */
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if there is an account with this email
    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      return res.status(404).json({ error: 'There is no account associated with this email.' });
    }
    // Check if the password matches the account associated with this email
    const isMatch = await foundUser.isValidPassword(password);
    // If not, handle it
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password.' });
    };
    // If user is not verified, warn and send email verification.
    if (!foundUser.isVerified) {
      await sendEmailVerification(email, foundUser.username, foundUser.verificationCode.value);
      return res.status(401).json({ error: 'You must verify your account before logging in. Check your email and click the link provided to continue.' });
    }
    // Create token and respond with it
    const token = signToken(foundUser);
    res.status(200).json({ token });
  } catch (error) {
    console.log(error);
  }
};

/**
 * Forgot password logic
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // Check if there is an account with this email
    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      return res.status(404).json({ error: 'There is no account associated with this email.' });
    }
    // Create recovery code and hash
    const code = generateNonce(16);
    foundUser.pwRecoveryCode.value = code;
    foundUser.pwRecoveryCode.createdAt = Date.now();
    foundUser.pwRecoveryHash = await createHash(code);
    await foundUser.save();
    // Send password recovery email
    await sendPasswordRecoveryEmail(email, foundUser.username, foundUser.pwRecoveryCode.value);
    // Respond with verification success message
    res.status(200).json({ message: 'An email has been sent to the address you provided with instructions to reset your password.' });
  } catch (error) {
    console.log(error);
  }
};

/**
 * Password recovery logic
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 */
const passwordRecovery = async (req, res) => {
  try {
    // Check username
    const { username, code } = req.params;
    const foundUser = await User.findOne({ username });
    // Handle no user
    if (!foundUser) {
      return res.status(404).json({ error: 'There is no account associated with this username.' });
    }
    // Check code against hash
    const isMatch = await foundUser.isValidPwRecoveryCode(code);
    // Handle no match
    if (!isMatch) {
      return res.status(401).json({ error: 'The recovery code does not match.' });
    };
    // Send response
    res.status(200).json({ msg: 'You can now create a new password', username, code });
  } catch (error) {
    console.log(error);
  }
};

/**
 * Change password logic
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 */
const changePassword = async (req, res) => {
  try {
    const _id = req.user;
    const { currentPassword, newPassword } = req.body;
    // Check if there is an account with this email
    const foundUser = await User.findOne({ _id });
    if (!foundUser) {
      return res.status(404).json({ error: 'There is no account associated with this id.' });
    }
    // Check if the password matches the account associated with this email
    const isMatch = await foundUser.isValidPassword(currentPassword);
    // If not, handle it
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password.' });
    };
    // Update user password
    await updatePassword(foundUser, newPassword);
    return res.status(200).json({ msg: 'New password set' });
  } catch (error) {
    console.log(error);
  }
};

/**
 * Create new password logic
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 */
const setNewPassword = async (req, res) => {
  // Check if there is an account with this username
  try {
    const { username, code, newPassword } = req.body;
    const foundUser = await User.findOne({ username });
    if (!foundUser) {
      return res.status(404).json({ error: 'There is no account associated with this username.' });
    }
    // Check the code against the hash
    const isMatch = await foundUser.isValidPwRecoveryCode(code);
    // If not, handle it
    if (!isMatch) {
      return res.status(401).json({ error: 'The recovery code does not match.' });
    };
    // Update the user's password and delete codes
    await updatePassword(foundUser, newPassword);
    foundUser.pwRecoveryCode = { value: null, createdAt: null };
    foundUser.pwRecoveryHash = null;
    await foundUser.save();
    // Send response to setNewPassword
    res.status(200).json({ msg: 'Your new password has been set.' });
  } catch (error) {
    console.log(error);
  }
};

/**
 * User account logic
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 */
const account = async (req, res) => {
  try {
    // Check if there is an account with this id
    const foundUser = await User.findOne({ _id: req.user });
    if (!foundUser) {
      return res.status(404).json({ error: 'There is no account associated with this id.' });
    }
    res.status(200).json({ foundUser });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  signUp,
  verify,
  signIn,
  forgotPassword,
  passwordRecovery,
  changePassword,
  setNewPassword,
  account
};