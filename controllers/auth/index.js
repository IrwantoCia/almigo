require('dotenv').config()
const express = require('express')
const router = express.Router()

const security = require('../../libs/security')
const type = require('../../libs/type')


router.route('/signup')
  .get(async (req, res) => {
    const renderData = {
      ...type.renderData,
      title: 'Sign Up',
      user: null,
      messages: [],
      isAuthenticated: false,
      currentUrl: req.originalUrl,
      meta: {
        description: 'Sign up page for My Application',
        keywords: 'signup, register, account'
      },
      error: null,
      success: null,
      data: {}
    };

    try {
      res.status(200).render('auth/signup', renderData);
    } catch (error) {
      renderData.error = 'Internal Server Error';
      res.status(500).render('auth/signup', renderData);
    }
  })

  .post(async (req, res) => {
    const { email, password, confirmPassword } = req.body;

    // Validate input
    if (!email || !password || !confirmPassword) {
      return res.status(400).render('auth/signup', {
        ...type.renderData,
        error: 'All fields are required'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).render('auth/signup', {
        ...type.renderData,
        error: 'Passwords do not match'
      });
    }

    const user = require('../../models/user');
    await user.init();

    // Check if user already exists
    const existingUser = await user.read({ email });
    if (existingUser.data.length > 0) {
      return res.status(409).render('auth/signup', {
        ...type.renderData,
        error: 'User already exists'
      });
    }

    // Hash the password
    const hashedPassword = await security.hashPassword(password);

    // Create new user
    const newUser = {
      email,
      password: hashedPassword,
      role: 'user'
    };

    // Save user to the database
    await user.create(newUser);

    res.redirect('/auth/signin');
  });

router.route('/signin')
  .get(async (req, res) => {
    const renderData = {
      ...type.renderData,
      title: 'Signin',
      user: req.session.user || null,
      messages: [],
      isAuthenticated: req.session.token ? true : false,
      currentUrl: req.originalUrl,
      meta: {
        description: 'Welcome to My Application',
        keywords: 'home, welcome, application'
      },
      error: null,
      success: null,
      data: {}
    };

    try {
      res.status(200).render('auth/signin', renderData);
    } catch (error) {
      renderData.error = 'Internal Server Error';
      res.status(500).render('/auth/signin', renderData);
    }
  })

  .post(async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).render('auth/signin', {
        ...type.renderData,
        error: 'Email and password are required'
      });
    }

    const user = require('../../models/user');
    await user.init();

    // Check if user exists
    const existingUser = await user.read({ email });
    if (existingUser.data.length === 0) {
      return res.status(401).render('auth/signin', {
        ...type.renderData,
        error: 'Invalid email or password'
      });
    }

    // Validate password
    const isPasswordValid = await security.verifyPassword(existingUser.data[0].password, password);
    if (!isPasswordValid) {
      return res.status(401).render('auth/signin', {
        ...type.renderData,
        error: 'Invalid email or password'
      });
    }

    // Generate session token
    const sessionToken = security.generateSessionToken(existingUser.data[0].id);
    req.session.token = sessionToken;

    res.redirect('/');
  });

router.get('/signout', (req, res) => {
  req.session = null;
  res.redirect('/auth/signin');
});

module.exports = router
