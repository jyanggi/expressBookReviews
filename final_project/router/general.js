const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "Username already exists" });
    }
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
  try {
    const getBooks = () => {
      return new Promise((resolve) => {
        resolve(books);
      });
    };
    const result = await getBooks();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books" });
  }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  })
  .then(book => res.status(200).json(book))
  .catch(err => res.status(404).json({ message: err }));
});
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  try {
    const author = req.params.author;
    const findByAuthor = () => {
      return new Promise((resolve) => {
        const result = [];
        for (const isbn in books) {
          if (books[isbn].author === author) {
            result.push({ isbn, ...books[isbn] });
          }
        }
        resolve(result);
      });
    };
    const result = await findByAuthor();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving author data" });
  }
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title;
  new Promise((resolve) => {
    const result = [];
    for (const isbn in books) {
      if (books[isbn].title === title) {
        result.push({ isbn, ...books[isbn] });
      }
    }
    resolve(result);
  }).then(data => res.status(200).json(data));
});

//  Get book review
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book.reviews);
    } else {
      reject("Book not found");
    }
  })
  .then(reviews => res.status(200).json(reviews))
  .catch(err => res.status(404).json({ message: err }));
});

module.exports.general = public_users;
