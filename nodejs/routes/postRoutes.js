//! This file contains the routes for the POST requests
const express = require("express");
const exphbs = require("express-handlebars");
const db = require("../db/dbOperations");
const bcrypt = require("bcrypt");
require("dotenv").config();
const router = express.Router();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const authenticateToken = require("../auth/auth");

//! rota para registrar o usuario
router.post("/register-user-success", async (req, res) => {
  const { name, password } = req.body;
  const saltRounds = 10; // Número de rodadas de sal, típico é 10 ou 12

  try {
    // Criar um hash da senha antes de salvar no banco de dados
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Inserir o usuário com a senha hash
    await db.insertUser(name, hashedPassword);

    // Redirecionar para a página de login após registro bem-sucedido
    res.redirect("/login");
  } catch (err) {
    // Verificar se o erro é devido a um nome de usuário já existente
    if (err.code === "ER_DUP_ENTRY") {
      // ER_DUP_ENTRY é um código comum para entradas duplicadas em SQL
      res.redirect(`/register?error=Nome já existe`);
    } else if (err.message === "Name or password cannot be null") {
      res.redirect("/register?error=Informe um nome e uma senha!");
    } else {
      console.error(err);
      res.status(500).send("Erro no servidor.");
    }
  }
});
//! rota para logar o usuario
router.post("/login-user-success", async (req, res) => {
  const { nameLogin, passwordLogin } = req.body;

  try {
    const searchUser = await db.selectUserByName(nameLogin);

    if (searchUser.length === 0) {
      // Se não encontrar o usuário, redireciona com mensagem de erro
      return res.redirect("/login?error=Usuário não encontrado");
    }

    const [rowDataPacket] = searchUser;
    const { name_user, password } = rowDataPacket;

    const passwordIsValid = await bcrypt.compare(passwordLogin, password);
    if (passwordIsValid) {
      const token = jwt.sign({ name_user }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      // Enviando o token via cookie
      res.cookie("token", token, {
        httpOnly: true, // O cookie não é acessível via JavaScript no cliente (protege contra ataques XSS)
        secure: process.env.NODE_ENV === "production", // Em produção, envie apenas via HTTPS
        sameSite: "strict", // Proteção contra ataques CSRF
        maxAge: 3600000, // Tempo de vida do cookie em milissegundos (1 hora)
      });

      res.redirect("/home");
    } else {
      // Se a senha não for válida, redireciona com mensagem de erro
      return res.redirect("/login?error=Senha incorreta");
    }
  } catch (error) {
    if (error.message === "User name cannot be null") {
      return res.redirect("/login?error=Informe um nome de usuário");
    }
    console.error(error);
    res.status(500).send("Erro no servidor.");
  }
});

module.exports = router;
