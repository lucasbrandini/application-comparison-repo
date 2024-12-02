const https = require("https");
const fs = require("fs");
const setupTables = require("./db/dbSetupTables");
const renderTemplate = require("./tools/renderTemplate");
const setupGetRoutes = require("./Routes/routesGet");
const setupPostRoutes = require("./Routes/routesPost");
const setupPutRoutes = require("./Routes/routesPut");
const setupDeleteRoutes = require("./Routes/routesDelete");
require("dotenv").config();

const PORT = process.env.PORT || 8000; // Definindo a porta como 8000 por padrão

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/lucascriado.com-0002/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/lucascriado.com-0002/fullchain.pem')
};

const server = https.createServer(options, (req, res) => {
  if (req.method === "GET" || req.method === "POST" || req.method === "PUT" || req.method === "DELETE") {
    if (req.method === "GET") {
      setupGetRoutes(req, res, renderTemplate);
    } else if (req.method === "POST") {
      setupPostRoutes(req, res);
    } else if (req.method === "PUT") {
      setupPutRoutes(req, res);
    } else if (req.method === "DELETE") {
      setupDeleteRoutes(req, res);
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