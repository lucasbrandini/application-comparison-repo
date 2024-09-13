const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/dbOperations");
const authenticateToken = require("../middleware/jwt");
const formidable = require("formidable");
require("dotenv").config();

function setupPutRoutes(req, res) {
  const parsedUrl = require("url").parse(req.url, true);
  const pathName = parsedUrl.pathname;

  const putRoutes = {
    "/change-username": handleChangeUsername,
    "/editpost": handleEditPost,
    "/edit-comment": handleEditComment,
    "/update-avatar": handleUpdateAvatar,
  };

  if (req.method === "PUT" && putRoutes[pathName]) {
    putRoutes[pathName](req, res);
  } else if (req.method === "PUT") {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  } else {
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method Not Allowed");
  }
}

async function handleChangeUsername(req, res) {
  authenticateToken(req, res, () => {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields) => {
      if (err) {
        console.error(`Erro durante o parsing do formulário: ${err.message}`);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, message: "Erro no servidor." })
        );
        return;
      }

      const newName = fields.username;
      const userName = req.user.name_user;

      console.log(newName, userName);

      try {
        const user = await db.selectUserByName(userName);
        if (!user || user.length === 0) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: false,
              message: "Usuário não encontrado",
            })
          );
          return;
        }

        const userId = user[0].id_user;
        const message = await db.changeUsername(userId, newName);

        if (message === "Username updated successfully.") {
          const token = jwt.sign(
            { name_user: newName },
            process.env.JWT_SECRET,
            { algorithm: "HS256" }
          );
          res.setHeader("Set-Cookie", `jwt_token=${token}; Path=/; HttpOnly`);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, message: message }));
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, message: message }));
        }
      } catch (err) {
        console.error(`Erro ao mudar o nome: ${err.message}`);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            message: `Erro no servidor: ${err.message}`,
          })
        );
      }
    });
  });
}

async function handleEditPost(req, res) {
  authenticateToken(req, res, () => {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error(`Erro durante o parsing do formulário: ${err.message}`);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, message: "Erro no servidor." })
        );
        return;
      }

      const postId = fields.post_id;
      const title = fields.title;
      const content = fields.content;

      try {
        // Lógica para verificar e processar o arquivo
        if (files.file) {
          const filePath = files.file.filepath;
          const fileType = files.file.mimetype;

          // Verifica se é uma imagem ou vídeo e processa
          const isImage = fileType.startsWith("image/");
          const fileData = fs.readFileSync(filePath);
          const fileBase64 = Buffer.from(fileData).toString("base64");

          if (isImage) {
            await db.updatePostImage(postId, title, content, fileBase64);
          } else {
            await db.updatePostVideo(postId, title, content, fileBase64);
          }
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            message: "Post atualizado com sucesso",
          })
        );
      } catch (err) {
        console.error(`Erro ao editar o post: ${err.message}`);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            message: `Erro no servidor: ${err.message}`,
          })
        );
      }
    });
  });
}

async function handleEditComment(req, res) {
  authenticateToken(req, res, () => {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields) => {
      if (err) {
        console.error(`Erro durante o parsing do formulário: ${err.message}`);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, message: "Erro no servidor." })
        );
        return;
      }

      const comment = fields.comment;
      const userId = fields.user_id;
      const postId = parseInt(fields.post_id, 10);
      const idComment = fields.id_comment;

      try {
        const message = await db.editCommentByAuthor(
          comment,
          userId,
          postId,
          idComment
        );

        if (message === "Comment updated successfully.") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, message: message }));
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, message: message }));
        }
      } catch (err) {
        console.error(`Erro ao editar o comentário: ${err.message}`);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            message: `Erro no servidor: ${err.message}`,
          })
        );
      }
    });
  });
}

async function handleUpdateAvatar(req, res) {
  authenticateToken(req, res, () => {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error(`Erro durante o parsing do formulário: ${err.message}`);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, message: "Erro no servidor." })
        );
        return;
      }

      const userName = req.user.name_user;
      const user = await db.selectUserByName(userName);
      const userId = user[0].id_user;
      const avatar = files.avatar

      if (avatar) {
        const filePath = avatar[0].filepath;
        const fileType = avatar[0].mimetype;

        if (
          fileType.startsWith("image/jpeg") ||
          fileType.startsWith("image/png")  ||
          fileType.startsWith("image/gif")
        ) {
          const fileData = fs.readFileSync(filePath);
          const fileBase64 = Buffer.from(fileData).toString("base64");

          try {
            await db.updateAvatar(userId, fileBase64);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                success: true,
                message: "Avatar atualizado com sucesso",
              })
            );
          } catch (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                success: false,
                message: `Erro no servidor: ${err.message}`,
              })
            );
          }
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: false,
              message: "Invalid file type. Please upload an image file.",
            })
          );
        }
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            message: "File field is empty or invalid",
          })
        );
      }
    });
  });
}

module.exports = setupPutRoutes;
