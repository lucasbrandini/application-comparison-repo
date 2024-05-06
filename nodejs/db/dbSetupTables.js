//! Create the tables in the database
const db = require("./dbConnection");

const setupTables = () => {
  db.getConnection((err, connection) => {
    if (err) {
      console.error("Failed to get database connection: ", err);
      return;
    }
    //! Define the tables to be created
    const tableDefinitions = [
      {
        tableName: "users",
        columns: `
        id_user INT AUTO_INCREMENT PRIMARY KEY,
        name_user VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `,
      },
      {
        tableName: "users_avatar",
        columns: `
        id_avatar INT AUTO_INCREMENT PRIMARY KEY,
        id_user INT,
        avatar_image LONGBLOB,
        date_insert TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_user) REFERENCES users(id_user)
    `,
      },
      {
        tableName: "posts",
        columns: `
        id_posts INT AUTO_INCREMENT PRIMARY KEY,
        p_id_user INT,
        post VARCHAR(1024) NOT NULL,
        post_image LONGBLOB,
        post_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (p_id_user) REFERENCES users(id_user)
    `,
      },
      {
        tableName: "comments",
        columns: `
        id_comment INT AUTO_INCREMENT PRIMARY KEY,
        p_id_user INT,
        p_id_post INT,
        comment VARCHAR(512) NOT NULL,
        comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (p_id_user) REFERENCES users(id_user),
        FOREIGN KEY (p_id_post) REFERENCES posts(id_posts)
    `,
      },
    ];

    //* Create the tables
    tableDefinitions.forEach((tableDef, index) => {
      const sql = `CREATE TABLE IF NOT EXISTS ${tableDef.tableName} (${tableDef.columns})`;
      connection.query(sql, (err) => {
        if (err) {
          console.error(`Error creating table ${tableDef.tableName}:`, err);
        } else {
          console.log(`Table ${tableDef.tableName} created successfully.`);
        }

        if (index === tableDefinitions.length - 1) {
          connection.release();
        }
      });
    });
  });
};

module.exports = setupTables;
