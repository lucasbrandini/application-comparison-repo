//! This file contains all the functions that interact with the database
const express = require("express");
const exphbs = require("express-handlebars");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const setupTables = require("./db/dbSetupTables");

const app = express();
const path = require('path');
const hbs = require('hbs');

app.engine(".hbs", exphbs.engine({ extname: ".hbs" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
hbs.registerPartials(path.join(__dirname, './views/partials'));
app.set("view engine", ".hbs");
app.use(cookieParser());
setupTables();
// Importando rotas
const getRoutes = require("./routes/getRoutes");
const postRoutes = require("./routes/postRoutes");

// Usando rotas
app.use(getRoutes);
app.use(postRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
