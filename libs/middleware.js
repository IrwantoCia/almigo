const multer = require('multer');
const jwt = require('jsonwebtoken');
const security = require('./security');

/**
 * Middleware to authenticate user session and verify JWT token.
 * If the user is authenticated and the token is valid, the decoded token and user data are attached to the request object.
 * If authentication fails, a 403 Forbidden or 404 Not Found error page is rendered.
 *
 * @param {Object} req - The request object containing session and token information.
 * @param {Object} res - The response object used to render error pages or proceed to the next middleware.
 * @param {Function} next - The next middleware function in the stack.
 * @returns {void} - If authentication fails, an error page is rendered. Otherwise, the next middleware is called.
 * @throws {Error} - Throws an error if the session or token is invalid.
 */
const authSessionMiddleware = async (req, res, next) => {
  try {
    // Check if the user is authenticated
    if (!req.session || !req.session.token) {
      // If not authenticated, render a 403 Forbidden HTML page
      console.error('Invalid token: No session or token found');
      throw new Error('Invalid token');
    }
    // Verify the JWT token from the session
    const decodedToken = jwt.verify(req.session.token, process.env.JWT_SECRET || 'default-secret');
    if (!decodedToken) {
      console.error('Invalid token: invalid token');
      throw new Error('Invalid token');
    }

    // Attach the decoded token to the request object for further use
    req.decodedToken = decodedToken;
    const user = require('../models/user');
    await user.init();
    const userData = await user.read({ id: decodedToken.userID });

    // Check if user exists
    if (userData.data.length === 0) {
      return res.status(404).render('error/404', { message: 'User not found.' });
    }

    // Attach the user data to the request object
    req.user = userData.data[0];

    // If authenticated and user found, proceed to the next middleware or route handler
    next();
  } catch (error) {
    // If token verification fails, render a 403 Forbidden HTML page
    return res.status(403).render('error/403', { message: 'Access Denied: Invalid or expired token.' });
  }
};

const csrfMiddleware = (req, res, next) => {
  const csrfSecret = req.session.csrfSecret; // Assuming the secret is stored in the session
  const csrfToken = req.headers['x-csrf-token']; // Assuming the token is sent in the headers

  if (!csrfSecret || !csrfToken) {
    return res.status(403).json({ error: 'CSRF token or secret missing' });
  }

  if (!security.verifyCSRF(csrfSecret, csrfToken)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next(); // Proceed to the next middleware or route handler
};

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});
const uploadMiddleware = multer({ storage: storage });

module.exports = { csrfMiddleware, authSessionMiddleware, uploadMiddleware }
