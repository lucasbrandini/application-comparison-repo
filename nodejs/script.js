const express = require("express");
const exphbs = require("express-handlebars");
const db = require("./db")();

const app = express();

app.engine(".hbs", exphbs.engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");

// Rota para a página inicial
app.get("/", (req, res) => {
  const nome = "Mundo";
  const number = 10;

  res.render("index", { nome, number });
});

app.get("/about", (req, res) => {
  res.render("about");
});
// Rota para a página de usuários
app.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const userData = await db.selectUser(userId);
    res.json(userData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar usuário");
  }
});
// Rota para a página de posts
app.get("/post/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const postData = await db.selectPost(postId);
    res.json(postData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar post");
  }
});
// Rota para a página de comentarios
app.get("/comment/:id", async (req, res) => {
  try {
    const commentId = req.params.id;
    const commentData = await db.selectComment(commentId);
    res.json(commentData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar comentario");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
