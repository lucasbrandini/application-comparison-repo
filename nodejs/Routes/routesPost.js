const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/dbOperations");
const authenticateToken = require("../middleware/jwt");
const formidable = require("formidable");
require("dotenv").config();

const saltRounds = 10;

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
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields) => {
    if (err) {
      console.error(`Erro durante o parsing do formulário: ${err.message}`);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Erro no servidor.");
      return;
    }

    const name = fields.name[0];
    const email = fields.email[0];
    const password = fields.password[0];

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
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields) => {
    if (err) {
      console.error(`Erro durante o parsing do formulário: ${err.message}`);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Erro no servidor.");
      return;
    }

    const name = fields.name[0];
    const password = fields.password[0];

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

// Função para verificar se o arquivo é válido
function isValidFileField(file) {
  return file && file[0].size > 0 && file[0].mimetype;
}

// Função para lidar com o upload do arquivo e convertê-lo em base64
function handleFileUpload(file) {
  const imageTypes = ['image/gif', 'image/jpeg', 'image/png'];
  const videoTypes = ['video/mp4'];
  const maxFileSize = 10 * 1024 * 1024; // 10 MB

  const fileData = fs.readFileSync(file[0].filepath);
  const fileSize = file[0].size;
  const fileType = file[0].mimetype;

  if (imageTypes.includes(fileType) && fileSize <= maxFileSize) {
    return { isImage: true, fileBase64: fileData.toString('base64') };
  } else if (videoTypes.includes(fileType) && fileSize <= maxFileSize) {
    return { isImage: false, fileBase64: fileData.toString('base64') };
  } else if (fileSize === 0) {
    throw new Error('Arquivo está vazio');
  } else {
    throw new Error('Tipo de arquivo ou tamanho inválido');
  }
}

// Função para lidar com a criação de post
async function handleCreatePost(req, res) {
  authenticateToken(req, res, () => {
    const form = new formidable.IncomingForm({
      allowEmptyFiles: true, // Permite arquivos vazios
      minFileSize: 0, // Permite tamanho mínimo de 0 bytes para evitar o erro
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error(`Erro durante o parsing do formulário: ${err.message}`);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Erro no servidor.');
        return;
      }

      const title = fields.title ? fields.title[0] : null;
      const content = fields.content ? fields.content[0] : '';
      const file = files.file; // Pode ser undefined se o arquivo não for enviado

      try {
        const userName = req.user.name_user;
        const user = await db.selectUserByName(userName);

        if (!user || user.length === 0) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Usuário não encontrado');
          return;
        }

        const userID = user[0].id_user;

        // Verifica se o arquivo é válido e se existe
        if (file && isValidFileField(file)) {
          const { isImage, fileBase64 } = handleFileUpload(file);

          if (isImage) {
            await db.insertPostWithImage(userID, title, content, fileBase64);
          } else {
            await db.insertPostWithVideo(userID, title, content, fileBase64);
          }
        } else {
          // Caso o arquivo não exista ou seja vazio, insere apenas o texto
          await db.insertPost(userID, title, content);
        }

        res.writeHead(302, { Location: '/home' });
        res.end();
      } catch (err) {
        console.error(`Erro durante a criação do post: ${err.message}`);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Erro no servidor: ${err.message}`);
      }
    });
  });
}

// Função para lidar com o logout
function handleLogout(req, res) {
  res.writeHead(302, {
    "Set-Cookie":
      "jwt_token=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    Location: "/login", // Redireciona para a página de login
  });
  res.end();
}

// Função principal para lidar com as requisições POST
function setupPostRoutes(req, res) {
  const parsedUrl = require("url").parse(req.url, true);
  const pathName = parsedUrl.pathname;

  // Definindo as rotas POST e suas funções
  const postRoutes = {
    "/register": handleRegister,
    "/login": handleLogin,
    "/logout": handleLogout,
    "/create-post": handleCreatePost,
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
