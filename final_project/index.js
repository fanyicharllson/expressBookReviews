const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');

const public_users = require('./router/general.js').general;
const authenticated = require('./router/auth_users.js').authenticated;
const isValid = require('./router/auth_users.js').isValid;
const authenticatedUser = require('./router/auth_users.js').authenticatedUser;

const app = express();
app.use(express.json());

// Session middleware
app.use(
  '/customer',
  session({
    secret: 'fingerprint_customer',
    resave: true,
    saveUninitialized: true,
  })
);

// JWT authentication middleware for /customer/auth/* routes
app.use('/customer/auth/*', function auth(req, res, next) {
  if (req.session.authorization) {
    const token = req.session.authorization['accessToken'];
    jwt.verify(token, 'access', (err, user) => {
      if (!err) {
        req.user = user;
        next();
      } else {
        return res.status(403).json({ message: 'User not authenticated' });
      }
    });
  } else {
    return res.status(403).json({ message: 'User not logged in' });
  }
});

// Routes
app.use('/customer', authenticated);
app.use('/', public_users);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;