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

const PORT = process.env.PORT || 3000;

db.deleteUser(11);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
