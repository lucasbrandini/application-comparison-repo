const fs = require("fs");
const path = require("path");
const axios = require("axios");
const db = require("../db/dbOperations");
const authenticateToken = require("../middleware/jwt");
const renderTemplate = require("../tools/renderTemplate");

// Função para servir arquivos estáticos
function serveStaticFile(filePath, res) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("File Not Found");
      return;
    }

    let contentType = "application/octet-stream"; // Tipo de conteúdo padrão
    if (filePath.endsWith(".css")) contentType = "text/css; charset=utf-8";
    else if (filePath.endsWith(".js"))
      contentType = "application/javascript; charset=utf-8";
    else if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg"))
      contentType = "image/jpeg";
    else if (filePath.endsWith(".png")) contentType = "image/png";
    else if (filePath.endsWith(".svg")) contentType = "image/svg+xml";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  });
}

// Função principal para lidar com as requisições
function setupGetRoutes(req, res, renderTemplate) {
  const parsedUrl = require("url").parse(req.url, true);
  const method = req.method;
  const pathName = parsedUrl.pathname;

  // Rotas definidas
  const routes = {
    "/": renderLogin,
    "/login": renderLogin,
    "/register": renderRegister,
    "/home": renderHome,
    "/commits": renderCommits,
  };

  if (method === "GET") {
    if (routes[pathName]) {
      routes[pathName](req, res);
    } else if (pathName.startsWith("/public/")) {
      const filePath = path.join(__dirname, "..", pathName);
      serveStaticFile(filePath, res);
    } else {
      render404(req, res);
    }
  } else {
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method Not Allowed");
  }
}

// Funções de renderização
function renderLogin(req, res) {
  renderTemplate("login", {}, res);
}

function renderRegister(req, res) {
  renderTemplate("register", {}, res);
}

function renderHome(req, res) {
  authenticateToken(req, res, () => {
    db.selectAllPostsOrdered()
      .then((posts) => {
        const userId = req.user.name_user;
        db.selectUserByName(userId)
          .then((user) => {
            const userVotes = {};
            db.findVote(user.id_user)
              .then((votes) => {
                votes.forEach((vote) => {
                  userVotes[vote.id_posts] = vote.user_vote;
                });

                posts.forEach((post) => {
                  post.user_vote = userVotes[post.id_posts] || "no vote";
                  if (post.post_image)
                    post.post_image = post.post_image.toString("utf-8");
                  if (post.post_video)
                    post.post_video = post.post_video.toString("utf-8");
                  if (post.avatar_image)
                    post.avatar_image = post.avatar_image.toString("utf-8");
                  post.is_owner = post.p_id_user === user.id_user;
                });

                renderTemplate(
                  "home",
                  { posts, user, name_user: user.name_user },
                  res
                );
              })
              .catch((err) => {
                console.error(err);
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Erro ao buscar votos");
              });
          })
          .catch((err) => {
            console.error(err);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Erro ao buscar usuário");
          });
      })
      .catch((err) => {
        console.error(err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Erro ao buscar posts");
      });
  });
}

async function renderCommits(req, res) {
  authenticateToken(req, res, async () => {
    let commits = [];
    let page = 1;
    try {
      while (true) {
        const response = await axios.get(
          `https://api.github.com/repos/lucaascriado/application-comparison-repo/commits?page=${page}`
        );
        if (response.data.length === 0) break;
        commits = commits.concat(response.data);
        page++;
      }
      renderTemplate("commits", { commits }, res);
    } catch (error) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Erro ao buscar commits");
    }
  });
}

function render404(req, res) {
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
}

module.exports = setupGetRoutes;
