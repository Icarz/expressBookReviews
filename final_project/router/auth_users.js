const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some((user) => user.username === username);
};

const authenticatedUser = async (username, password) => {
  let user = users.find((user) => user.username === username);
  if (user) {
    return await bcrypt.compare(password, user.password);
  }
  return false;
};

regd_users.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  console.log(users); // Debugging: Check if user is being stored correctly
  return res.status(201).json({ message: "User created successfully" });
});

//only registered users can login
regd_users.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!(await authenticatedUser(username, password))) {
    console.log("Users array:", users); // Debugging: Check stored users
    console.log("Login attempt:", username, password); // Debugging: Check login credentials
    return res.status(403).json({ message: "User not authenticated" });
  }

  let accessToken = jwt.sign({ data: username }, "fingerprint_customer", {
    expiresIn: 60 * 60,
  });
  req.session.username = username;
  req.session.authorization = { accessToken };

  return res.json({
    message: "User logged in successfully",
    token: accessToken, // Include the token in the response
  });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  let userd = req.session.username;
  console.log("Logged-in user:", userd);
  let ISBN = req.params.isbn;
  let details = req.query.review;
  console.log("Review details:", details);

  if (!books[ISBN]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[ISBN].reviews) {
    books[ISBN].reviews = {};
  }

  books[ISBN].reviews[userd] = details;
  // Add this console log
  console.log(`Book reviews after addition: `, books[ISBN].reviews);
  return res.status(201).json({ message: "Review added successfully" });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  let ISBN = req.params.isbn;
  let userd = req.session.username;

  if (!books[ISBN]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (books[ISBN].reviews && books[ISBN].reviews[userd]) {
    delete books[ISBN].reviews[userd];
    return res.status(200).json({ message: "Review has been deleted" });
  } else {
    return res.status(404).json({ message: "Review not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
