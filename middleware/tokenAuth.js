const jwt = require("jsonwebtoken");
const config = require("config");

// Middleware to verify login token
function tokenAuth(req, res, next) {
  // Retrieve token
  const token = req.cookies["x-auth-token"];
  if (token == "null")
    return res.status(401).send("Access denied: no token provided.");

  // Decode the token and attach info to req
  try {
    const decoded = jwt.verify(token, config.get("authTokenKey"));
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send("Invalid token");
  }
}

module.exports = tokenAuth;
