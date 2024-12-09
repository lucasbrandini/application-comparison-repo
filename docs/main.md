
## Como subir meu código - Exemplo de um PR, partindo a 'main' e voltando para 'main' de forma atualiziada

No VSCode,

```bash
  git checkout main
  git pull
  <faça as alterações que precisa fazer>
  git add .
  git checkout -B <nome-da-sua-branch>
  git commit -m "<mensagem para seu commit, lembre de usar prefixos como fix | chore | feat>"
  git push origin <nome-da-sua-branch>
```

No Github,

```bash
  https://github.com/lucaascriado/application-comparison-repo
  - Vai aparecer uma mensagem para criar um pull request, faça isso e manda para o grupo com um @lucas para o merge 
```

Depois que for mergeado, 

```bash
  git checkout main
  git pull
  <pode fazer suas pŕoximas alterações>
```

## Como me conectar com o banco de dados pela primeira vez

```bash
  Instale o mysql installer por aqui https://dev.mysql.com/downloads/file/?id=526408
  Instale ele em modo FULL
  Depois vá para o mysql client command line e digite o sequintes comandos
  CREATE DATABASE python;
  CREATE USER 'admin'@'localhost' IDENTIFIED BY 'Password1!';
  GRANT ALL ON python.* TO 'admin'@'localhost';
  FLUSH PRIVILEGES;
  ALTER USER 'admin'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Password1!';
  SET GLOBAL log_bin_trust_function_creators = 1;
```

## Instalações NodeJS 

```bash
  npm i nodemon -g
  npm install jsonwebtoken dotenv cookie-parser bcrypt ou npm install
```

Depois crie um arquivo chamando .env 

```bash
  JWT_SECRET=secret
  DB_HOST=localhost
  DB_USER=admin
  DB_PASSWORD=Password1!
  DB_NAME=python
```

## Instalações Python

```bash
  pip install pybars3 requests sqlalchemy mysql-connector-python python-dotenv bcrypt pyjwt
```

Depois crie um arquivo chamando .env 

```bash
  JWT_SECRET=secret
  DB_HOST=localhost
  DB_USER=admin
  DB_PASSWORD=Password1!
  DB_NAME=python
```

Depois rode o projeto com,

```bash
  python script.py
```

Teste