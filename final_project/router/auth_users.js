const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  const user = users.find((user) => user.username === username);
  return user && user.password === password;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Generate JWT token
  const token = jwt.sign({ username }, "your_jwt_secret", { expiresIn: "1h" });
  return res.status(200).json({ message: "Login successful", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(token, "your_jwt_secret", (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    const username = decoded.username;
    const { review } = req.body;
    const { isbn } = req.params;

    if (!review) {
      return res.status(400).json({ message: "Review content is required" });
    }

    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!book.reviews) {
      book.reviews = {};
    }
    book.reviews[username] = review;

    return res
      .status(200)
      .json({ message: "Review added/updated successfully" });
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
