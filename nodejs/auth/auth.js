//! This file contains the functions to authenticate the user and generate a token.
const express = require("express");
const bcrypt = require("bcrypt");
require("dotenv").config();
const router = express.Router();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

function authenticateToken(req, res, next) {
  const token = req.cookies ? req.cookies["token"] : null;

  if (!token) {
    return res.redirect("login");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send("Token inválido.");
    }
    req.user = decoded;
    next();
  });
}

module.exports = authenticateToken;
