const renderData = {
  title: 'My Application', // Default title for the page
  user: null, // Placeholder for user data, to be populated if user is logged in
  messages: [], // Array to store flash messages or notifications
  csrfToken: '', // CSRF token for form submissions
  isAuthenticated: false, // Boolean to check if the user is authenticated
  currentUrl: '/', // Current URL for navigation or redirection purposes
  meta: {
    description: 'Default meta description for SEO',
    keywords: 'default, keywords, for, SEO'
  },
  error: null, // Placeholder for error messages
  success: null, // Placeholder for success messages
  data: {} // Generic object to pass additional data specific to the page
};

// Example usage in a route handler:
// res.render('page', { ...renderData, user: req.user, isAuthenticated: req.isAuthenticated() });

module.exports = {
  renderData
}
