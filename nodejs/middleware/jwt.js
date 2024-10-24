const http = require("http");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const cookie = require("cookie");

function authenticateToken(req, res, next) {
  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
  const token = cookies["jwt_token"];

  if (!token) {
    res.writeHead(302, { Location: "/login" });
    return res.end();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err || !decoded) {
      console.log("Token verification failed:", err);
      res.writeHead(302, { Location: "/login" });
      return res.end();
    }

    req.user = decoded; 
    next();
  });
}

module.exports = authenticateToken;
