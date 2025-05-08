const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Helper to check if a username already exists
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Helper to check if username and password match
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

//only registered users can login
regd_users.post("/login", (req,res) => {
 const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const accessToken = jwt.sign(
    { username },
    "fingerprint_customer",
    { expiresIn: "1h" }
  );

  req.session.authorization = { accessToken };
  return res.status(200).json({ message: "User logged in successfully", accessToken });
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const { username } = req.user;  
  const { review } = req.query;  
  if (!review) {
      return res.status(400).json({ message: "Review text is required" });
  }

  const isbn = req.params.isbn;
  let book = books[isbn]; 


  if (!book) {
      return res.status(404).json({ message: "Book not found" });
  }


  if (!book.reviews) {
      book.reviews = {};
  }

  if (book.reviews[username]) {
      book.reviews[username] = review;
      return res.status(200).json({ message: "Review updated successfully", review });
  } else {

      book.reviews[username] = review;
      return res.status(200).json({ message: "Review added successfully", review });
  }
  });
  

  regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { username } = req.user;
    const isbn = req.params.isbn;

    let book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!book.reviews || !book.reviews[username]) {
        return res.status(404).json({ message: "No review by this user found for this book" });
    }

    delete book.reviews[username];

    return res.status(200).json({ message: "Review deleted successfully" });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
