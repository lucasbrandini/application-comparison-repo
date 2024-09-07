// postRoutes.js
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/dbOperations"); // Certifique-se de que a conexão e operações do db estão configuradas corretamente
require("dotenv").config();

const saltRounds = 10;

// Função para converter dados de formulário para objeto
function parseFormData(body) {
  const data = new URLSearchParams(body);
  const result = {};
  for (const [key, value] of data.entries()) {
    result[key] = value;
  }
  return result;
}

// Função para enviar resposta com cookie JWT
function sendCookieResponse(res, token, location) {
  res.writeHead(302, {
    "Set-Cookie": `jwt_token=${token}; Path=/; HttpOnly`,
    Location: location,
  });
  res.end();
}

// Função para lidar com o registro de usuário
async function handleRegister(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    const { name, email, password } = parseFormData(body);

    try {
      const userExists = await db.selectUserByName(name);
      if (userExists.length > 0) {
        res.writeHead(302, { Location: "/register?error=Nome já existe" });
        res.end();
        return;
      }

      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const userId = await db.insertUser(name, email, hashedPassword);

      // Gerar um avatar aleatório e inseri-lo no banco de dados
      const avatarImage = generateRandomAvatar();
      await db.insertAvatar(userId, avatarImage);

      res.writeHead(302, { Location: "/login" });
      res.end();
    } catch (err) {
      console.error(`Erro durante o registro: ${err.message}`);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Erro no servidor.");
    }
  });
}

// Função para lidar com o login de usuário
async function handleLogin(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    const { name, password } = parseFormData(body);

    try {
      const user = await db.selectUserByName(name);

      if (user.length > 0 && bcrypt.compareSync(password, user[0].password)) {
        const token = jwt.sign(
          { name_user: user[0].name_user },
          process.env.JWT_SECRET,
          { algorithm: "HS256" }
        );
        sendCookieResponse(res, token, "/home");
      } else {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            message: "Usuário ou senha incorretos",
          })
        );
      }
    } catch (err) {
      console.error(`Erro durante o login: ${err.message}`);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Erro no servidor.");
    }
  });
}

// Função para gerar um avatar aleatório
function generateRandomAvatar() {
  const avatarDir = path.join(__dirname, "..", "public", "img");
  if (!fs.existsSync(avatarDir)) {
    throw new Error("O diretório de avatares não existe.");
  }
  const allFiles = fs.readdirSync(avatarDir);
  const avatars = allFiles.filter((file) =>
    [".jpg", ".jpeg"].includes(path.extname(file).toLowerCase())
  );
  if (avatars.length === 0) {
    throw new Error("Nenhum avatar JPG ou JPEG encontrado no diretório.");
  }
  const selectedAvatar = avatars[Math.floor(Math.random() * avatars.length)];
  const imagePath = path.join(avatarDir, selectedAvatar);
  const imageBuffer = fs.readFileSync(imagePath);
  return Buffer.from(imageBuffer).toString("base64");
}

// Função principal para lidar com as requisições POST
function setupPostRoutes(req, res) {
  const parsedUrl = require("url").parse(req.url, true);
  const pathName = parsedUrl.pathname;

  // Definindo as rotas POST e suas funções
  const postRoutes = {
    "/register": handleRegister,
    "/login": handleLogin,
    // Adicione aqui outras rotas POST e suas funções
  };

  // Verifica se o método é POST e se a rota existe
  if (req.method === "POST" && postRoutes[pathName]) {
    postRoutes[pathName](req, res);
  } else if (req.method === "POST") {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  } else {
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method Not Allowed");
  }
}

module.exports = setupPostRoutes;
