const posts = [
    {
        "nome": "João",
        "conteudo": "Hoje é um dia maravilhoso!"
    },
    {
        "nome": "Maria",
        "conteudo": "Estou tão animada para o fim de semana!"
    },
    {
        "nome": "Pedro",
        "conteudo": "Acabei de assistir um ótimo filme."
    },
    {
        "nome": "Ana",
        "conteudo": "Que dia ensolarado! Perfeito para um piquenique."
    },
    {
        "nome": "Lucas",
        "conteudo": "Acabei de terminar de ler um livro incrível."
    },
    {
        "nome": "Carla",
        "conteudo": "Estou me preparando para viajar nas férias."
    },
    {
        "nome": "Mariana",
        "conteudo": "Que saudades dos amigos."
    },
    {
        "nome": "Rafael",
        "conteudo": "Treinei muito hoje, estou exausto!"
    },
    {
        "nome": "Juliana",
        "conteudo": "Amando cada momento da minha viagem."
    },
    {
        "nome": "Gustavo",
        "conteudo": "Que jogo emocionante! Meu time venceu!"
    },
    {
        "nome": "Fernanda",
        "conteudo": "Finalmente chegou o tão esperado feriado."
    },
    {
        "nome": "André",
        "conteudo": "Iniciando um novo projeto hoje."
    },
    {
        "nome": "Beatriz",
        "conteudo": "Sábado à noite: pizza e filme com os amigos."
    },
    {
        "nome": "Camila",
        "conteudo": "Estou com vontade de fazer algo diferente."
    },
    {
        "nome": "Rodrigo",
        "conteudo": "Acabei de fazer uma caminhada revigorante."
    }
]

const postsHTML = posts.map(post => `
    <div class="post">
        <h2>${post.nome}</h2>
        <p>${post.conteudo}</p>
    </div>
`).join('');

document.getElementById('posts').innerHTML = postsHTML;
