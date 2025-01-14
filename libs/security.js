const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Tokens = require('csrf');


/**
 * Generates a session token using JWT for a given user ID.
 * 
 * @param {string} userID - The unique identifier of the user for whom the session token is generated.
 * @returns {string} - A JWT token that expires in 24 hours.
 * 
 * @example
 * const token = generateSessionToken('12345');
 * console.log(token); // Outputs the generated JWT token
 */
function generateSessionToken(userID) {
  const secret = process.env.JWT_SECRET || 'default-secret';
  const token = jwt.sign({ userID: userID }, secret, { expiresIn: '24h' });
  return token;
}

/**
 * Hashes a password using bcrypt.
 * @param {string} password - The plain text password to hash.
 * @returns {Promise<string>} - A promise that resolves to the hashed password.
 */
async function hashPassword(password) {
  const saltRounds = 10; // Number of salt rounds for bcrypt
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verifies a plain text password against a hashed password.
 * @param {string} hashedPassword - The hashed password to compare against.
 * @param {string} textPassword - The plain text password to verify.
 * @returns {Promise<boolean>} - A promise that resolves to true if the passwords match, false otherwise.
 */
async function verifyPassword(hashedPassword, textPassword) {
  return await bcrypt.compare(textPassword, hashedPassword);
}

/**
 * Generates a new CSRF token and its corresponding secret.
 * @returns {Object} An object containing the generated secret and token.
 * @property {string} secret - The secret key used to generate the token.
 * @property {string} token - The generated CSRF token.
 */
function generateCSRF() {
  const tokens = new Tokens();
  const secret = tokens.secretSync(); // Generate a secret key
  const token = tokens.create(secret); // Create a token using the secret
  return { secret, token }; // Return both secret and token for storage and verification
}

/**
 * Verifies a CSRF token against its corresponding secret.
 * @param {string} secret - The secret key used to generate the token.
 * @param {string} token - The CSRF token to verify.
 * @returns {boolean} Returns `true` if the token is valid, otherwise `false`.
 */
function verifyCSRF(secret, token) {
  const tokens = new Tokens();
  return tokens.verify(secret, token); // Verify the token against the secret
}

module.exports = {};
module.exports = {
  generateSessionToken,
  hashPassword, verifyPassword,
  generateCSRF, verifyCSRF
}

