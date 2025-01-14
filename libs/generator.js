/**
 * Generates a random request ID.
 * 
 * This function creates a random string by combining two random alphanumeric strings.
 * The resulting string is suitable for use as a unique request ID.
 * 
 * @returns {string} A randomly generated request ID.
 */
const randomRequestID = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

module.exports = { randomRequestID };
