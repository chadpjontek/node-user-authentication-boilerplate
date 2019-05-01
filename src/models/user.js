const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { generateNonce } = require('../helpers');
const Schema = mongoose.Schema;

// Create a schema
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    value: {
      type: String,
      default: generateNonce(16)
    },
    createdAt: {
      type: Date,
      default: Date.now()
    }
  },
  activationHash: String,
  pwRecoveryCode: {
    value: String,
    createdAt: Date
  },
  pwRecoveryHash: String
});

// Create hashes on first save
userSchema.pre('save', async function () {
  try {
    if (this.isNew) {
      // Generate salts
      const passwordSalt = await bcrypt.genSalt(10);
      const activationSalt = await bcrypt.genSalt(10);
      // Generate hashes
      const passwordHash = await bcrypt.hash(this.password, passwordSalt);
      const activationHash = await bcrypt.hash(this.verificationCode.value, activationSalt);
      // Re-assign hashed versions
      this.password = passwordHash;
      this.activationHash = activationHash;
    }
  } catch (error) {
    console.log(error);
  }
});

/** Function to compare password to hashed password in db */
userSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    console.log(error);
  }
};

/** Function to compare verification code with activation hash */
userSchema.methods.isVerifiedEmail = async function (code) {
  try {
    return await bcrypt.compare(code, this.activationHash);
  } catch (error) {
    console.log(error);
  }
};

/** Function to compare verification code with activation hash */
userSchema.methods.isValidPwRecoveryCode = async function (pwRecoveryCode) {
  try {
    // If code is older than 30 mins, reject with reason
    const currentTime = Date.now();
    const codeAge = this.pwRecoveryCode.createdAt;
    if ((currentTime - codeAge) > (1000 * 60 * 30)) {
      throw new Error('Code has expired');
    }
    return await bcrypt.compare(pwRecoveryCode, this.pwRecoveryHash);
  } catch (error) {
    console.log(error);
  }
};

// Create a model
const User = mongoose.model('user', userSchema);

// Export the model
module.exports = User;