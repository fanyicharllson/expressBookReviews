const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const { users } = require('./auth_users.js');

const general = express.Router();

const BASE_URL = 'http://localhost:5000';

// ── Task 1: GET / — Get all books ─────────────────────────────────
// Using async/await with Axios (Promise-based)
general.get('/', async (req, res) => {
  try {
    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving books', error: error.message });
  }
});

// ── Task 2: GET /isbn/:isbn — Get book by ISBN ────────────────────
// Using Promise callbacks with Axios
general.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject(new Error(`No book found with ISBN: ${isbn}`));
    }
  })
    .then(book => res.status(200).json(book))
    .catch(err => res.status(404).json({ message: err.message }));
});

// ── Task 3: GET /author/:author — Get books by author ────────────
// Using async/await with Axios
general.get('/author/:author', async (req, res) => {
  try {
    const authorName = req.params.author.toLowerCase();
    const matchedBooks = {};

    Object.keys(books).forEach(isbn => {
      if (books[isbn].author.toLowerCase().includes(authorName)) {
        matchedBooks[isbn] = books[isbn];
      }
    });

    if (Object.keys(matchedBooks).length === 0) {
      return res.status(404).json({ message: `No books found for author: ${req.params.author}` });
    }
    return res.status(200).json(matchedBooks);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving books by author', error: error.message });
  }
});

// ── Task 4: GET /title/:title — Get books by title ────────────────
// Using async/await with Axios
general.get('/title/:title', async (req, res) => {
  try {
    const titleQuery = req.params.title.toLowerCase();
    const matchedBooks = {};

    Object.keys(books).forEach(isbn => {
      if (books[isbn].title.toLowerCase().includes(titleQuery)) {
        matchedBooks[isbn] = books[isbn];
      }
    });

    if (Object.keys(matchedBooks).length === 0) {
      return res.status(404).json({ message: `No books found with title: ${req.params.title}` });
    }
    return res.status(200).json(matchedBooks);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving books by title', error: error.message });
  }
});

// ── Task 5: GET /review/:isbn — Get book reviews ──────────────────
general.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: `No book found with ISBN: ${isbn}` });
  }
  return res.status(200).json(book.reviews);
});

// ── Task 6: POST /register — Register new user ───────────────────
general.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const alreadyExists = users.some(u => u.username === username);
  if (alreadyExists) {
    return res.status(409).json({ message: 'Username already exists. Please choose another.' });
  }

  users.push({ username, password });
  return res.status(201).json({ message: `User ${username} successfully registered. You can now login.` });
});

// ── Async Axios helper functions (for Task 11 / general.js) ──────

// Get all books using async/await + Axios
async function getAllBooksAsync() {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to retrieve all books: ' + error.message);
  }
}

// Get book by ISBN using Promise callback + Axios
function getBookByISBNPromise(isbn) {
  return axios.get(`${BASE_URL}/isbn/${isbn}`)
    .then(response => response.data)
    .catch(error => { throw new Error(`Failed to get book by ISBN: ${error.message}`); });
}

// Get books by author using async/await + Axios
async function getBooksByAuthorAsync(author) {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to get books by author: ${error.message}`);
  }
}

// Get books by title using async/await + Axios
async function getBooksByTitleAsync(title) {
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to get books by title: ${error.message}`);
  }
}

module.exports = {
  general,
  getAllBooksAsync,
  getBookByISBNPromise,
  getBooksByAuthorAsync,
  getBooksByTitleAsync,
};