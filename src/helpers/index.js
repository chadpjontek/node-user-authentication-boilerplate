const crypto = require('crypto');

/**
* Returns a cryptographic nonce
* @param {num} bytes - The length of the nonce in bytes
*/
const generateNonce = (bytes) => {
  return crypto.randomBytes(bytes).toString('hex');
};

module.exports = {
  generateNonce
};