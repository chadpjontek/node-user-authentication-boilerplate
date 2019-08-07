const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, SMTP_HOST, SMTP_PORT, SMTP_AUTH_USER, SMTP_AUTH_PASS, MAIL_FROM, PROTOCOL, DOMAIN } = require('../config');

/**
 * Sends a email verification link to the supplied email
 * @param {string} email - User email
 * @param {string} username - User name
 * @param {string} code - Verification code
 */
const sendEmailVerification = async (email, username, code) => {
  try {
    // SMTP transport
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: true, // true for 465, false for other ports
      auth: {
        user: SMTP_AUTH_USER,
        pass: SMTP_AUTH_PASS
      }
    });
    // Create HTML to send in email
    const verifyLink = `${PROTOCOL}://${DOMAIN}:${process.env.PORT}/api/users/email-verification/${username}/${code}`;
    const htmlBody = `
<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="ie=edge">
<title>Email Verification</title>
<style>
body {
  margin: 0 auto;
  padding: 0;
  text-align: center;
}
div {
  background: #eee;
}
</style>
</head>

<body>
<h1>Hi ${username}!</h1>
<div>
<p>Your account has been created. Please <a href="${verifyLink}">CLICK HERE</a> to verify your email.</p>
</div>
</body>

</html>`;
    // setup mail options
    const mailOptions = {
      from: MAIL_FROM, // sender address
      to: email,
      subject: 'Verify your account',
      text: `Your account has been created. Please visit ${verifyLink} to verify your email.`, // plain text body
      html: htmlBody
    };
    // send mail with defined transport object
    let info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.log(error);
  }
};

/**
 * Sends a password recovery link to the supplied email
 * @param {string} email - User email
 * @param {string} username - Username
 * @param {string} code - Recovery code
 */
const sendPasswordRecoveryEmail = async (email, username, code) => {
  try {
    // SMTP transport
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: true, // true for 465, false for other ports
      auth: {
        user: SMTP_AUTH_USER,
        pass: SMTP_AUTH_PASS
      }
    });

    // Create HTML to send in email
    const pwResetLink = `${PROTOCOL}://${DOMAIN}:${process.env.PORT}/api/users/password-recovery/${username}/${code}`;
    const htmlBody = `
<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="ie=edge">
<title>Password Reset</title>
<style>
body {
  margin: 0 auto;
  padding: 0;
  text-align: center;
}
div {
  background: #eee;
}
</style>
</head>

<body>
<h1>Hi ${username}!</h1>
<div>
<p>You can reset your password now. Please <a href="${pwResetLink}">CLICK HERE</a> to be taken to the new password creation screen.</p>
</div>
</body>

</html>`;

    // setup mail options
    const mailOptions = {
      from: MAIL_FROM, // sender address
      to: email,
      subject: 'Reset your password',
      text: `You can reset your password now. Please visit ${pwResetLink} to be taken to the new password creation screen.`, // plain text body
      html: htmlBody
    };

    // send mail with defined transport object
    let info = await transporter.sendMail(mailOptions);

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.log(error);
  }
};

/**
 * Create a JWT for a user.
 * @param {User} user - User object to create JWT for.
 */
const signToken = user => {
  return jwt.sign({ issuer: 'issuer', subject: user.id }, JWT_SECRET, { expiresIn: '1d' });
};

/**
  * A function to return a bcrypt hash from a give value.
  * @param {string} value - The value to be hashed
  */
const createHash = async (value) => {
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // return hash
    return await bcrypt.hash(value, salt);
  } catch (error) {
    console.log(error);
  }
};

/**
 * Update user password.
 * @param {User} user - The user to update password on.
 * @param {string} newPassword - The new password to be set.
 */
const updatePassword = async (user, newPassword) => {
  try {
    user.password = await createHash(newPassword);
    await user.save();
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  sendEmailVerification,
  sendPasswordRecoveryEmail,
  signToken,
  createHash,
  updatePassword
};