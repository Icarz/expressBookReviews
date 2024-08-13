const express = require("express");
const bcrypt = require("bcrypt");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword }); // Add new user

  console.log("Users array:", users); // Debugging: Check if user is being stored correctly
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  const booksJson = JSON.stringify(books, null, 2);
  res.setHeader("Content-Type", "application/json");
  res.send(booksJson);
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = parseInt(req.params.isbn, 10); // Convert the ISBN to an integer

  // Directly access the book by key
  const book = books[isbn];

  if (book) {
    res.json(book);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;

  // Convert the books object to an array of values
  const booksArray = Object.values(books);

  // Filter books by the matching author
  const booksByAuthor = booksArray.filter((b) => b.author === author);

  if (booksByAuthor.length > 0) {
    res.json(booksByAuthor);
  } else {
    res.status(404).json({ message: "No books found by this author" });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;

  // Convert the books object to an array of values
  const booksArray = Object.values(books);

  // Find books with the matching title
  const booksByTitle = booksArray.filter((b) => b.title === title);

  if (booksByTitle.length > 0) {
    res.json(booksByTitle);
  } else {
    res.status(404).json({ message: "No books found with this title" });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = parseInt(req.params.isbn, 10); // Convert the ISBN to an integer

  // Directly access the book by key
  const book = books[isbn];

  if (book) {
    // Return the reviews for the book
    res.json(book.reviews || {}); // Return an empty object if there are no reviews
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
