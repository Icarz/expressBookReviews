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
public_users.get("/", async (req, res) => {
  try {
    const bookList = await Promise.resolve(books); // Simulate async behavior
    res.status(200).json(bookList);
  } catch (error) {
    res.status(500).json({ message: "Error fetching book list", error });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const book = await Promise.resolve(books[isbn]); // Simulate async behavior
    if (book) {
      res.status(200).json(book);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    res.status(404).json({ message: "Error fetching book details", error });
  }
});

// Get book details based on author
public_users.get("/author/:author", async (req, res) => {
  const author = req.params.author;
  try {
    const booksByAuthor = await Promise.resolve(
      Object.values(books).filter((book) => book.author === author)
    ); // Simulate async behavior
    if (booksByAuthor.length > 0) {
      res.status(200).json(booksByAuthor);
    } else {
      res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    res.status(404).json({ message: "Error fetching books by author", error });
  }
});

// Get all books based on title
public_users.get("/title/:title", async (req, res) => {
  const title = req.params.title;
  try {
    const booksByTitle = await Promise.resolve(
      Object.values(books).filter((book) => book.title === title)
    ); // Simulate async behavior
    if (booksByTitle.length > 0) {
      res.status(200).json(booksByTitle);
    } else {
      res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    res.status(404).json({ message: "Error fetching books by title", error });
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
