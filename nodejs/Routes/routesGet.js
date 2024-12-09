const fs = require("fs");
const path = require("path");
const axios = require("axios");
const db = require("../db/dbOperations");
const authenticateToken = require("../middleware/jwt");
const renderTemplate = require("../tools/renderTemplate");
const formidable = require("formidable");

function serveStaticFile(filePath, res) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("File Not Found");
      return;
    }

    let contentType = "application/octet-stream";
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

function setupGetRoutes(req, res, renderTemplate) {
  const parsedUrl = require("url").parse(req.url, true);
  const method = req.method;
  const pathName = parsedUrl.pathname;

  const routes = {
    "/": renderLogin,
    "/login": renderLogin,
    "/register": renderRegister,
    "/home": renderHome,
    "/commits": renderCommits,
    "/configuration": renderConfigurations,
    "/comments": renderComments,
    "/edit-post": renderEditPost,
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

function renderLogin(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const error = url.searchParams.get("error");
  renderTemplate("login", { error }, res);
}

function renderRegister(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const error = url.searchParams.get("error");
  renderTemplate("register", { error }, res);
}

function renderHome(req, res) {
  authenticateToken(req, res, () => {
    db.selectAllPostsOrdered()
      .then((posts) => {
        const userId = req.user.name_user;
        db.selectUserByName(userId)
          .then((user) => {
            const userVotes = {};
            db.findVote(user[0].id_user)
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
                  post.is_owner = post.p_id_user === user[0].id_user;
                });

                const context = {
                  posts,
                  user,
                  name_user: user[0].name_user,
                };

                renderTemplate("home", context, res);
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

async function renderConfigurations(req, res) {
  authenticateToken(req, res, async () => {
    try {
      const name_user = req.user.name_user;
      const user = await db.selectUserByName(name_user);
      const user_id = user[0].id_user;

      let avatar = await db.selectAvatar(user_id);

      if (avatar.avatar_image) {
        avatar.avatar_image = Buffer.isBuffer(avatar.avatar_image)
          ? avatar.avatar_image.toString("utf-8")
          : avatar.avatar_image;
      }

      const context = {
        user: user[0],
        avatar,
      };

      renderTemplate("configuration", context, res);
    } catch (e) {
      console.error(e);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Server Error: " + e.message);
    }
  });
}

async function renderComments(req, res) {
  authenticateToken(req, res, async () => {
    const parsedUrl = require("url").parse(req.url, true);
    const queryParams = parsedUrl.query;

    const post_id = parseInt(queryParams.post_id, 10);

    if (!post_id) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Post ID não fornecido.");
      return;
    }

    try {
      const name_user = req.user.name_user;
      const user = await db.selectUserByName(name_user);
      const user_id = user[0].id_user;
      const user_avatar = await db.selectAvatar(user_id);

      const post = await db.getPost(post_id);
      const post_id_user = post[0].p_id_user;
      const post_author = await db.selectUserInfo(post_id_user);

      post.post_image = post[0].post_image
        ? post[0].post_image.toString("utf-8")
        : null;
      post.post_video = post[0].post_video
        ? post[0].post_video.toString("utf-8")
        : null;

      const hasMedia = post[0].post_image || post[0].post_video ? 1 : 0;

      const raw_comments = await db.getCommentsByPostId(post_id);

      const total_comments = raw_comments.length;

      const comments = await Promise.all(
        raw_comments.map(async (comment) => {
          const comment_user_info = await db.selectUserInfo(comment.p_id_user);
          return {
            id_comment: comment.id_comment,
            p_id_post: comment.p_id_post,
            name_user: comment_user_info.name_user,
            avatar_image: comment_user_info.avatar_image
              ? comment_user_info.avatar_image.toString("utf-8")
              : null,
            comment: comment.comment,
            comment_date: comment.comment_date,
            is_author: comment.p_id_user === user_id,
            id_user: user_id,
          };
        })
      );

      const context = {
        comments,
        comment_count: total_comments,
        post_id,
        post_author: post_author.name_user,
        post_avatar: post_author.avatar_image
          ? post_author.avatar_image.toString("utf-8")
          : null,
        post_title: post[0].post_title,
        post_description: post[0].post,
        post_image: post.post_image,
        post_video: post.post_video,
        is_post_owner: post[0].p_id_user === user_id,
        post_date: post[0].post_date,
        user_avatar: user_avatar.avatar_image
          ? user_avatar.avatar_image.toString("utf-8")
          : null,
        user_name: name_user,
        hasMedia: hasMedia,
        user: user[0]
      };

      renderTemplate("comments", context, res);
    } catch (e) {
      console.error(e);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Server Error: " + e.message);
    }
  });
}

async function renderEditPost(req, res) {
  authenticateToken(req, res, async () => {
    const parsedUrl = require("url").parse(req.url, true);
    const queryParams = parsedUrl.query;

    const post_id = parseInt(queryParams.post_id, 10);

    if (!post_id) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Post ID não fornecido.");
      return;
    }

    try {
      const name_user = req.user.name_user;
      const user = await db.selectUserByName(name_user);
      const user_id = user[0].id_user;
      const post = await db.getPost(post_id);

      if (post.length === 0) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Post não encontrado.");
        return;
      }
      if (post[0].p_id_user !== user_id) {
        res.writeHead(403, { "Content-Type": "text/plain" });
        res.end("Você não tem permissão para editar este post.");
        return;
      }

      post.post_image = post[0].post_image
        ? post[0].post_image.toString("utf-8")
        : null;
      post.post_video = post[0].post_video
        ? post[0].post_video.toString("utf-8")
        : null;

      const postContext = {
        id_posts: post[0].id_posts,
        post_title: post[0].post_title,
        post: post[0].post,
        post_image: post.post_image,
        post_video: post.post_video,
      };
      const context = {
        post: postContext,
        is_owner: post[0].p_id_user === user_id,
      };

      renderTemplate("edit", context, res);
    } catch (e) {
      console.error(e);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Server Error: " + e.message);
    }
  });
}

function render404(req, res) {
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
}

module.exports = setupGetRoutes;
