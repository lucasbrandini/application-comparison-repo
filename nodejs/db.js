const mysql = require("mysql");

const connectDatabase = () => {
  const connection = mysql.createConnection({
    host: process.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "123456",
    database: process.env.DB_NAME || "mydb",
  });

  connection.connect((err) => {
    if (err) throw err;
    console.log("Connected to the database.");

    const tableDefinitions = [
      {
        tableName: "Usuarios",
        columns: `
        id_user INT AUTO_INCREMENT PRIMARY KEY,
        name_user VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `,
      },
      {
        tableName: "Posts",
        columns: `
        id_posts INT AUTO_INCREMENT PRIMARY KEY,
        p_id_user INT,
        post VARCHAR(1024) NOT NULL,
        post_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (p_id_user) REFERENCES Usuarios(id_user)
      `,
      },
      {
        tableName: "Comentarios",
        columns: `
        id_comment INT AUTO_INCREMENT PRIMARY KEY,
        p_id_user INT,
        p_id_post INT,
        comment VARCHAR(512) NOT NULL,
        comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (p_id_user) REFERENCES Usuarios(id_user),
        FOREIGN KEY (p_id_post) REFERENCES Posts(id_posts)
      `,
      },
    ];

    tableDefinitions.forEach((tableDef) => {
      const sql = `CREATE TABLE IF NOT EXISTS ${tableDef.tableName} (${tableDef.columns})`;
      connection.query(sql, (err, result) => {
        if (err) throw err;
        console.log(`Table ${tableDef.tableName} created successfully.`);
      });
    });
  });

  return connection;
};

module.exports = connectDatabase;
