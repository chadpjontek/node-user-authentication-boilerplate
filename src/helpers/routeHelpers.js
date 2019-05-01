const Joi = require('joi');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

/** Schema objects to validate against with Joi */
const schemas = {
  /** User sign up validation schema */
  signup: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    username: Joi.string().alphanum().min(3).max(16).required()
  }),
  /** User sign in validation schema */
  signin: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  /** Forgot password validation schema */
  forgotPassword: Joi.object().keys({
    email: Joi.string().email().required()
  }),
  /** Change password validation schema */
  changePassword: Joi.object().keys({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().required()
  }),
  /** Set new password validation schema */
  setNewPassword: Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(16).required(),
    code: Joi.string().required(),
    newPassword: Joi.string().required()
  })
};

/**
 * Function to validate req body with Joi
 * @param {schemas} schema - The schema type to validate against
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const result = Joi.validate(req.body, schema);
    if (result.error) {
      return res.status(400).json(result.error);
    }
    // Validation passed
    next();
  };
};

/** Authorization middleware function. Verifies the JWT before allowing access to route. */
const tokenAuth = () => {
  return (req, res, next) => {
    const token = req.header('x-auth-token');
    // Check for token
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      // Add user from payload
      req.user = decoded.subject;
      next();
    } catch (error) {
      res.status(400).json({ msg: 'Token is not valid' });
    }
  };
};

/** User verification middleware function. Verifies the user from database before allowing access to route. */
const userAuth = () => {
  return async (req, res, next) => {
    const { username } = req.body;
    // Check if there is an account with this username
    const foundUser = await User.findOne({ username });
    if (!foundUser) {
      return res.status(404).json({ error: 'There is no account associated with this username.' });
    }

    // Check the code against the hash
    const isMatch = await foundUser.isValidPwRecoveryCode(code);

    // If not, handle it
    if (!isMatch) {
      return res.status(401).json({ error: 'The verification code does not match.' });
    };

    // Send response to setNewPassword
    res.status(200).json({
      msg: 'Set a new password now.',
      _id: foundUser._id
    });
  };
};

module.exports = {
  schemas,
  validateBody,
  tokenAuth,
  userAuth
};