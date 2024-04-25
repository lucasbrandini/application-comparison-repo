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

// rota para home
router.get("/home", authenticateToken, (req, res) => {
  // Asegure-se de que o userId está disponível no objeto do usuário
  //if (!req.user || !req.user.userId) {
  //  return res.status(400).send("Informações do usuário não disponíveis");
  // }

  // Renderizando o template "home" e passando o userId como parte dos dados
  //res.render("home", { userId: req.user.userId });
  res.render("home");
});

// Rota para a página inicial
router.get("/", (req, res) => {
  res.render("login");
});

router.get("/about", (req, res) => {
  res.render("about");
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

// rota para ir para tela de commits do github
router.get("/github", (req, res) => {
  res.render("github");
});

module.exports = router;
