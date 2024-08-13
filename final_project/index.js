const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;

const app = express();

app.use(express.json());

app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

app.use("/customer/auth/*", function auth(req, res, next) {
  // Get the token from the Authorization header
  const authHeader = req.headers["authorization"];
  console.log("Authorization Header:", authHeader); // Debugging

  // Check if the Authorization header is present and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  // Extract the token from the "Bearer " prefix
  const token = authHeader.split(" ")[1];
  console.log("Token:", token); // Debugging

  // Verify the token using the secret key
  jwt.verify(token, "fingerprint_customer", (err, decoded) => {
    if (err) {
      console.log("Token verification error:", err); // Debugging
      return res.status(403).json({ message: "Invalid token." });
    }

    // Attach the decoded token to the request object (optional)
    req.user = decoded;

    // Call the next middleware or route handler
    next();
  });
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
