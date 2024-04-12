const express = require("express");
const exphbs = require("express-handlebars");
const db = require("./db")();
const bcrypt = require("bcrypt");
require("dotenv").config();
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

app.engine(".hbs", exphbs.engine({ extname: ".hbs" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.set("view engine", ".hbs");
app.use(cookieParser());

// Rota para a página inicial
app.get("/", (req, res) => {
  res.render("login");
});

app.get("/about", (req, res) => {
  res.render("about");
});
// Rota para a página de usuários
app.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const userData = await db.selectUser(userId);
    res.json(userData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar usuário");
  }
});

// Rota para a página de usuários
app.get("/users", async (req, res) => {
  try {
    const userData = await db.selectAllUsers();
    res.json(userData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar usuário");
  }
});

// Rota para a página de posts
app.get("/post/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const postData = await db.selectPost(postId);
    res.json(postData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar post");
  }
});

// Rota para todos os posts de um usuario
app.get("/posts/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const postData = await db.selectAllPostsFromUser(userId);
    res.json(postData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar post");
  }
});

// Rota para a página de comentarios
app.get("/comment/:id", async (req, res) => {
  try {
    const commentId = req.params.id;
    const commentData = await db.selectComment(commentId);
    res.json(commentData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar comentario");
  }
});

// rota para ir para tela de registro
app.get("/register", (req, res) => {
  res.render("register");
});

// rota para ir para tela de login
app.get("/login", (req, res) => {
  res.render("login");
});

// rota para home
// app.get("/home", autenticToken (req, res) => {
//   res.render("home")
// })

function authenticateToken(req, res, next) {
  const token = req.cookies ? req.cookies["token"] : null;

  if (!token) {
    return res.status(401).send("Acesso Negado. Token não fornecido.");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send("Token inválido.");
    }
    req.user = decoded;
    next();
  });
}

// rota para home
app.get("/home", authenticateToken, (req, res) => {
  // Asegure-se de que o userId está disponível no objeto do usuário
  //if (!req.user || !req.user.userId) {
  //  return res.status(400).send("Informações do usuário não disponíveis");
  // }

  // Renderizando o template "home" e passando o userId como parte dos dados
  //res.render("home", { userId: req.user.userId });
  res.render("home");
});

// rota para registrar o usuario
app.post("/register-user-success", async (req, res) => {
  const { name, password } = req.body;
  const saltRounds = 10; // Número de rodadas de sal, típico é 10 ou 12

  try {
    // Criar um hash da senha antes de salvar no banco de dados
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Inserir o usuário com a senha hash
    await db.insertUser(name, hashedPassword);

    // Redirecionar para a página de login após registro bem-sucedido
    res.redirect("/login");
  } catch (err) {
    console.error(err);

    // Verificar se o erro é devido a um nome de usuário já existente
    if (err.code === "ER_DUP_ENTRY") {
      // ER_DUP_ENTRY é um código comum para entradas duplicadas em SQL
      res.status(409).send("Usuário já existe");
    } else {
      res.status(500).send("Erro ao registrar usuário");
    }
  }
});
// rota para logar o usuario
app.post("/login-user-success", async (req, res) => {
  const { nameLogin, passwordLogin } = req.body;

  try {
    const searchUser = await db.selectUserByName(nameLogin);

    if (searchUser.length === 0) {
      return res.status(404).send("Usuário não encontrado.");
    }

    const [rowDataPacket] = searchUser;
    const { name_user, password } = rowDataPacket;

    // Verificar senha usando bcrypt
    const passwordIsValid = await bcrypt.compare(passwordLogin, password);
    if (passwordIsValid) {
      const token = jwt.sign({ name_user }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      // Enviando o token via cookie
      res.cookie("token", token, {
        httpOnly: true, // O cookie não é acessível via JavaScript no cliente (protege contra ataques XSS)
        secure: process.env.NODE_ENV === "production", // Em produção, envie apenas via HTTPS
        sameSite: "strict", // Proteção contra ataques CSRF
        maxAge: 3600000, // Tempo de vida do cookie em milissegundos (1 hora)
      });

      res.redirect("/home");
    } else {
      res.status(401).send("Senha inválida.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro no servidor.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
