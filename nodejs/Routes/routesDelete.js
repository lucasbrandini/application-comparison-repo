const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/dbOperations");
const authenticateToken = require("../middleware/jwt");
const formidable = require("formidable");
require("dotenv").config();

function setupDeleteRoutes(req, res) {
  const parsedUrl = require("url").parse(req.url, true);
  const pathName = parsedUrl.pathname;

  // Definindo as rotas delete e suas funções
  const deleteRoutes = {
    "/delete-post": handle_delete_post,
    "/delete-comment": handle_delete_comment,
  };

  // Verifica se o método é POST e se a rota existe
  if (req.method === "DELETE" && deleteRoutes[pathName]) {
    deleteRoutes[pathName](req, res);
  } else if (req.method === "DELETE") {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  } else {
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method Not Allowed");
  }
}

async function handle_delete_post(req, res) {
  authenticateToken(req, res, async () => {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields) => {
      if (err) {
        console.error(`Erro durante o parsing do formulário: ${err.message}`);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Erro no servidor." }));
        return;
      }

      const postId = fields.post_id[0];
      const userName = req.user.name_user;

      try {
        const user = await db.selectUserByName(userName);
        const userId = user[0].id_user;

        const postFromDb = await db.getPost(postId);

        if (postFromDb.length === 0) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Post not found" }));
          return;
        }

        if (postFromDb[0].p_id_user !== userId) {
          res.writeHead(403, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error:
                "Forbidden: You do not have permission to delete this post",
            })
          );
          return;
        }

        await db.deletePost(postId);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: true, message: "Delete successfully" })
        );
      } catch (err) {
        console.error(`Erro ao deletar post: ${err.message}`);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
    });
  });
}

async function handle_delete_comment(req, res) {
  authenticateToken(req, res, async () => {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields) => {
      if (err) {
        console.error(`Erro durante o parsing do formulário: ${err.message}`);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Erro no servidor." }));
        return;
      }

      const commentId = fields.comment_id[0];
      const userName = req.user.name_user;

      try {
        const user = await db.selectUserByName(userName);
        const userId = user[0].id_user;

        const commentFromDb = await db.getComment(commentId);

        if (commentFromDb.length === 0) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Comment not found" }));
          return;
        }

        if (commentFromDb[0].p_id_user !== userId) {
          res.writeHead(403, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error:
                "Forbidden: You do not have permission to delete this comment",
            })
          );
          return;
        }

        await db.deleteComment(commentId);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: true, message: "Delete successfully" })
        );
      } catch (err) {
        console.error(`Erro ao deletar comentário: ${err.message}`);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
    });
  });
}

function render404(req, res) {
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
}

module.exports = setupDeleteRoutes;
