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


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
