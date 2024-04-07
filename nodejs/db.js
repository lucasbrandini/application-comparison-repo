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
      connection.query(sql, (err) => {
        if (err) throw err;
        console.log(`Table ${tableDef.tableName} created successfully.`);
      });
    });
  });

  // SELECT
  function selectUser(userId) {
    return new Promise((resolve, reject) => {
      if (!userId) {
        reject(new Error("User ID cannot be null"));
        return;
      }

      const sql = `SELECT * FROM Usuarios WHERE id_user = ?`;
      connection.query(sql, [userId], function (err, results) {
        if (err) {
          reject(err);
          return;
        }

        resolve(results);
      });
    });
  }

  // INSERT
  function insertUser(name, password, callback) {
    if (!name || !password) {
      callback(new Error("Name or password cannot be null"));
      return;
    }

    const sql = "INSERT INTO Usuarios (name_user, password) VALUES (?, ?)";
    connection.query(sql, [name, password], callback);
  }

  // DELETE
  function deleteUser(userId, callback) {
    if (!userId) {
      callback(new Error("User ID cannot be null"));
      return;
    }

    const sql = `DELETE FROM Usuarios WHERE id_user = ?`;
    connection.query(sql, [userId], callback);
  }

  // UPDATE
  function updateUser(userId, newName, callback) {
    if (!userId || !newName) {
      callback(new Error("User ID or new name cannot be null"));
      return;
    }

    const sql = `UPDATE Usuarios SET name_user = ? WHERE id_user = ?`;
    connection.query(sql, [newName, userId], callback);
  }

  return { connection, selectUser, insertUser, deleteUser, updateUser };
};

module.exports = connectDatabase;
