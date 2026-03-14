const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const authenticated = express.Router();
let users = [];

// Check if username is valid (exists)
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Check if username + password match
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// ── POST /customer/login ──────────────────────────────────────────
authenticated.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({ data: username }, 'access', { expiresIn: '1h' });
    req.session.authorization = { accessToken, username };
    return res.status(200).json({ message: 'User successfully logged in', accessToken });
  } else {
    return res.status(401).json({ message: 'Invalid login. Check username and password' });
  }
});

// ── PUT /customer/auth/review/:isbn ──────────────────────────────
authenticated.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found' });
  }
  if (!review) {
    return res.status(400).json({ message: 'Review text is required as a query parameter' });
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: `Review successfully added/updated by ${username}`,
    reviews: books[isbn].reviews,
  });
});

// ── DELETE /customer/auth/review/:isbn ───────────────────────────
authenticated.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found' });
  }
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: 'No review found for this user on this book' });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: `Review by ${username} on ISBN ${isbn} has been deleted`,
    reviews: books[isbn].reviews,
  });
});

module.exports = { authenticated, isValid, authenticatedUser, users };