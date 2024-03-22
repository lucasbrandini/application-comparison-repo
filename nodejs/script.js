const express = require('express');
const exphbs  = require('express-handlebars');

const app = express();

// Configuração do Handlebars
app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');

// Rota para a página inicial
app.get('/', (req, res) => {
  // Definindo uma variável que será passada para o front-end
  const nome = 'Mundo';
  const number = 10;
  
  // Renderizando o template handlebars com a variável
  res.render('index', { nome, number });
});

app.get('/about', (req, res) => {
    res.render('about');
});

// Iniciando o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
