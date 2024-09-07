const http = require("http");
const setupTables = require("./db/dbSetupTables");
const renderTemplate = require("./tools/renderTemplate");
const setupGetRoutes = require("./Routes/routesGet");
const setupPostRoutes = require("./Routes/routesPost");
require("dotenv").config();

const PORT = process.env.PORT; // Definindo a porta como 8000 por padrão

const server = http.createServer((req, res) => {
  if (req.method === "GET" || req.method === "POST") {
    if (req.method === "GET") {
      setupGetRoutes(req, res, renderTemplate);
    } else if (req.method === "POST") {
      setupPostRoutes(req, res);
    }
  } else {
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method Not Allowed");
  }
});

// Configuração das tabelas do banco de dados
setupTables();

// Iniciando o servidor na porta especificada
server.listen(PORT, () => {
  console.log('\u001b[36m',`Servidor rodando na porta ${PORT}`, '\u001b[0m');
});
