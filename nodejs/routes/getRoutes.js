//! This file contains the routes for the GET requests
const express = require("express");
const exphbs = require("express-handlebars");
const bcrypt = require("bcrypt");
require("dotenv").config();
const router = express.Router();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const authenticateToken = require("../auth/auth");
const db = require("../db/dbOperations");
const axios = require('axios');

// rota para home
router.get("/home", authenticateToken, (req, res) => {

  // Renderizando o template "home" e passando o userId como parte dos dados
  res.render("home");
});

// Rota para a página inicial
router.get("/", (req, res) => {
  res.render("login");
});

// Rota para a página de usuários
router.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const userData = await db.selectUser(userId);
    res.json(userData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar usuário");
  }
});

// Rota para a página de usuários
router.get("/users", async (req, res) => {
  try {
    const userData = await db.selectAllUsers();
    res.json(userData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar usuário");
  }
});

// Rota para a página de posts
router.get("/post/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const postData = await db.selectPost(postId);
    res.json(postData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar post");
  }
});

// Rota para todos os posts de um usuario
router.get("/posts/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const postData = await db.selectAllPostsFromUser(userId);
    res.json(postData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar post");
  }
});

// Rota para a página de comentarios
router.get("/comment/:id", async (req, res) => {
  try {
    const commentId = req.params.id;
    const commentData = await db.selectComment(commentId);
    res.json(commentData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar comentario");
  }
});

// rota para ir para tela de registro
router.get("/register", (req, res) => {
  res.render("register");
});

// rota para ir para tela de login
router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/commits", authenticateToken, async (req, res) => {
  let commits = [];
  let page = 1;
  while (true) {
    try {
      const response = await axios.get(`https://api.github.com/repos/lucaascriado/application-comparison-repo/commits?page=${page}`);
      if (response.status === 200) {
        const newCommits = response.data;
        if (!newCommits.length) {
          break;
        }
        commits = commits.concat(newCommits);
        page += 1;
      } else {
        res.status(response.status).send("Failed to fetch commits");
        return;
      }
    } catch (error) {
      res.status(500).send("An error occurred while fetching commits");
      return;
    }
  }
  res.render("commits", { commits });
});

module.exports = router;
