const db = require("./dbConnection");

const setupTables = () => {
  db.getConnection((err, connection) => {
    if (err) {
      console.error("Failed to get database connection: ", err);
      return;
    }

    const tableDefinitions = [
      {
        tableName: "users",
        columns: `
          id_user INT AUTO_INCREMENT PRIMARY KEY,
          name_user VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
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
          post_title VARCHAR(196),
          post VARCHAR(1024),
          post_image LONGBLOB,
          post_video LONGBLOB,
          post_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          post_votes INT DEFAULT 0,
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
      {
        tableName: "votes",
        columns: `
          id_vote INT AUTO_INCREMENT PRIMARY KEY,
          id_user INT,
          id_post INT,
          vote_type ENUM('upvote', 'downvote'),
          vote_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (id_user) REFERENCES users(id_user),
          FOREIGN KEY (id_post) REFERENCES posts(id_posts),
          UNIQUE KEY unique_vote (id_user, id_post)
        `,
      }
    ];

    //* Create tables sequentially to avoid issues with foreign key constraints
    const createTable = (index) => {
      if (index >= tableDefinitions.length) {
        createTrigger(); // Proceed to create trigger after all tables are created
        return;
      }

      const tableDef = tableDefinitions[index];
      const sql = `CREATE TABLE IF NOT EXISTS ${tableDef.tableName} (${tableDef.columns})`;

      connection.query(sql, (err) => {
        if (err) {
          console.error('\x1b[31m', 'Error creating table ${tableDef.tableName}:', err, '\x1b[0m');
        } else {
          console.log('\x1b[38;5;215m', `Table ${tableDef.tableName} created successfully.`, '\x1b[0m');
        }

        createTable(index + 1);
      });
    };

    //* Create trigger after creating all tables
    const createTrigger = () => {
      const checkTriggerSql = "SHOW TRIGGERS LIKE 'posts'";
      connection.query(checkTriggerSql, (err, results) => {
        if (err) {
          console.error("Error checking for existing triggers:", err);
          connection.release();
          return;
        }

        const triggerExists = results.some((trigger) => trigger.Trigger === 'before_post_delete');

        if (!triggerExists) {
          const triggerSql = `
            CREATE TRIGGER before_post_delete
            BEFORE DELETE ON posts
            FOR EACH ROW
            BEGIN
              DELETE FROM comments WHERE p_id_post = OLD.id_posts;
            END
          `;

          connection.query(triggerSql, (err) => {
            if (err) {
              console.error('\x1b[31m', 'Error creating trigger before_post_delete:', err, '\x1b[0m');
            } else {
              console.log('\x1b[32m', "Trigger before_post_delete created successfully.", '\x1b[0m');
            }
            connection.release();
          });
        } else {
          console.error('\x1b[38;5;226m', "Trigger before_post_delete already exists.", '\x1b[0m');
          connection.release();
        }
      });
    };

    createTable(0); // Start the table creation process
  });
};

module.exports = setupTables;
