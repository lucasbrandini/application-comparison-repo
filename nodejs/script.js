const express = require("express");
const exphbs = require("express-handlebars");
const db = require("./db")();

const app = express();

app.engine(".hbs", exphbs.engine({ extname: ".hbs" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.set("view engine", ".hbs"); 

// Rota para a página inicial
app.get("/", (req, res) => {
  const nome = "Mundo";
  const number = 10;

  res.render("index", { nome, number });
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
  res.render("register")
})

// rota para ir para tela de login
app.get("/login", (req, res) => {
  res.render("login")
})

// rota para home
// app.get("/home", autenticToken (req, res) => {
//   res.render("home")
// })

// rota para home
app.get("/home", (req, res) => {
  res.render("home")
})

// rota para registrar o usuario
app.post("/register-user-sucess", (req, res) => {
  const { name, password } = req.body 
  try {
    db.insertUser(name, password)
    res.redirect("/login");
  } catch (error) {
    console.error(err);
  }
})

app.post("/login-user-sucess", async (req, res) => {
  const { nameLogin, passwordLogin } = req.body
  const searchUser = await db.selectUserByName(nameLogin)
  const [ RowDataPacket ] = searchUser
  const { name_user, password } = RowDataPacket
  const hasPassword = password === passwordLogin
  
  if (name_user && hasPassword) {
    res.redirect("home")
  } else {
    res.status(500).send("Erro ao buscar usuario");
  }
}) 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

