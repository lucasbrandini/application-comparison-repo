const mysql = require("mysql");

// Create a function that connects to the database
const connectDatabase = () => {
  const connection = mysql.createConnection({
    host: process.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "123456",
    database: process.env.DB_NAME || "mydb", // criar o banco de dados no mysql com o nome "mydb",
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
  // User functions
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
  // Select all users
  function selectAllUsers() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM Usuarios`;
      connection.query(sql, function (err, results) {
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
  // Post functions
  // SELECT
  function selectPost(postId) {
    return new Promise((resolve, reject) => {
      if (!postId) {
        reject(new Error("Post ID cannot be null"));
        return;
      }

      const sql = `SELECT * FROM Posts WHERE id_posts = ?`;
      connection.query(sql, [postId], function (err, results) {
        if (err) {
          reject(err);
          return;
        }

        resolve(results);
      });
    });
  }
  // Select all posts from a user
  function selectAllPostsFromUser(userId) {
    return new Promise((resolve, reject) => {
      if (!userId) {
        reject(new Error("User ID cannot be null"));
        return;
      }

      const sql = `SELECT * FROM Posts WHERE p_id_user = ?`;
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
  function insertPost(p_id_user, post, callback) {
    if (!p_id_user || !post) {
      callback(new Error("User ID or post cannot be null"));
      return;
    }

    const sql = "INSERT INTO Posts (p_id_user, post) VALUES (?, ?)";
    connection.query(sql, [p_id_user, post], callback);
  }
  // DELETE
  function deletePost(postId, callback) {
    if (!postId) {
      callback(new Error("Post ID cannot be null"));
      return;
    }

    const sql = `DELETE FROM Posts WHERE id_posts = ?`;
    connection.query(sql, [postId], callback);
  }
  // UPDATE
  function updatePost(postId, newPost, callback) {
    if (!postId || !newPost) {
      callback(new Error("Post ID or new post cannot be null"));
      return;
    }

    const sql = `UPDATE Posts SET post = ? WHERE id_posts = ?`;
    connection.query(sql, [newPost, postId], callback);
  }
  // Comment functions
  // SELECT
  function selectComment(commentId) {
    return new Promise((resolve, reject) => {
      if (!commentId) {
        reject(new Error("Comment ID cannot be null"));
        return;
      }

      const sql = `SELECT * FROM Comentarios WHERE id_comment = ?`;
      connection.query(sql, [commentId], function (err, results) {
        if (err) {
          reject(err);
          return;
        }

        resolve(results);
      });
    });
  }
  // Select all comments from a post
  function selectAllCommentsFromPost(postId) {
    return new Promise((resolve, reject) => {
      if (!postId) {
        reject(new Error("Post ID cannot be null"));
        return;
      }

      const sql = `SELECT * FROM Comentarios WHERE p_id_post = ?`;
      connection.query(sql, [postId], function (err, results) {
        if (err) {
          reject(err);
          return;
        }

        resolve(results);
      });
    });
  }
  // INSERT
  function insertComment(p_id_user, p_id_post, comment, callback) {
    if (!p_id_user || !p_id_post || !comment) {
      callback(new Error("User ID, post ID or comment cannot be null"));
      return;
    }

    const sql =
      "INSERT INTO Comentarios (p_id_user, p_id_post, comment) VALUES (?, ?, ?)";
    connection.query(sql, [p_id_user, p_id_post, comment], callback);
  }
  // DELETE
  function deleteComment(commentId, callback) {
    if (!commentId) {
      callback(new Error("Comment ID cannot be null"));
      return;
    }

    const sql = `DELETE FROM Comentarios WHERE id_comment = ?`;
    connection.query(sql, [commentId], callback);
  }
  // UPDATE
  function updateComment(commentId, newComment, callback) {
    if (!commentId || !newComment) {
      callback(new Error("Comment ID or new comment cannot be null"));
      return;
    }

    const sql = `UPDATE Comentarios SET comment = ? WHERE id_comment = ?`;
    connection.query(sql, [newComment, commentId], callback);
  }

  return {
    connection,
    selectUser,
    insertUser,
    deleteUser,
    updateUser,
    selectPost,
    insertPost,
    deletePost,
    updatePost,
    selectComment,
    insertComment,
    deleteComment,
    updateComment,
    selectAllPostsFromUser,
    selectAllUsers,
    selectAllCommentsFromPost,
  };
};

module.exports = connectDatabase;
