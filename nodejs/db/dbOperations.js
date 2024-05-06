//! This file contains all the functions that interact with the database
const db = require("./dbConnection");

//! Table User Functions
//* SELECT
function selectUser(userId) {
  return new Promise((resolve, reject) => {
    if (!userId) {
      return reject(new Error("User ID cannot be null"));
    }
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = `SELECT * FROM users WHERE id_user = ?`;
      connection.query(sql, [userId], (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  });
}

//* Select all users
function selectAllUsers() {
  return new Promise((resolve, reject) => {
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = `SELECT * FROM users`;
      connection.query(sql, (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  });
}

//* Select user by name
function selectUserByName(name) {
  return new Promise((resolve, reject) => {
    if (!name) {
      return reject(new Error("User name cannot be null"));
    }
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = `SELECT * FROM users WHERE name_user = ?`;
      connection.query(sql, [name], (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  });
}

//* INSERT
function insertUser(name, password) {
  return new Promise((resolve, reject) => {
    if (!name || !password) {
      return reject(new Error("Name or password cannot be null"));
    }
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = "INSERT INTO users (name_user, password) VALUES (?, ?)";
      connection.query(sql, [name, password], (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  });
}

//* DELETE
function deleteUser(userId) {
  return new Promise((resolve, reject) => {
    if (!userId) {
      return reject(new Error("User ID cannot be null"));
    }
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = `DELETE FROM users WHERE id_user = ?`;
      connection.query(sql, [userId], (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  });
}

//* UPDATE
function updateUser(userId, newName) {
  return new Promise((resolve, reject) => {
    if (!userId || !newName) {
      return reject(new Error("User ID or new name cannot be null"));
    }
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = `UPDATE users SET name_user = ? WHERE id_user = ?`;
      connection.query(sql, [newName, userId], (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  });
}

//! Table Post Functions
//* SELECT
function selectPost(postId) {
  return new Promise((resolve, reject) => {
    if (!postId) {
      return reject(new Error("Post ID cannot be null"));
    }
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = `SELECT * FROM Posts WHERE id_posts = ?`;
      connection.query(sql, [postId], (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  });
}

//* Select all posts from a user
function selectAllPostsFromUser(userId) {
  return new Promise((resolve, reject) => {
    if (!userId) {
      return reject(new Error("User ID cannot be null"));
    }
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = `SELECT * FROM Posts WHERE p_id_user = ?`;
      connection.query(sql, [userId], (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  });
}

//* INSERT
function insertPost(userId, post) {
  return new Promise((resolve, reject) => {
    if (!userId || !post) {
      return reject(new Error("User ID or post cannot be null"));
    }
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = "INSERT INTO Posts (p_id_user, post) VALUES (?, ?)";
      connection.query(sql, [userId, post], (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  });
}
//! Insert post with image
function insertPostWithImage(userId, post, image) {
  return new Promise((resolve, reject) => {
    if (!userId || !post || !image) {
      return reject(new Error("User ID, post or image cannot be null"));
    }
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = "INSERT INTO Posts (p_id_user, post, post_image) VALUES (?, ?, ?)";
      connection.query(sql, [userId, post, image], (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  });
}



//* DELETE
function deletePost(postId) {
  return new Promise((resolve, reject) => {
    if (!postId) {
      return reject(new Error("Post ID cannot be null"));
    }
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = `DELETE FROM Posts WHERE id_posts = ?`;
      connection.query(sql, [postId], (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  });
}

//* UPDATE
function updatePost(postId, newPost) {
  return new Promise((resolve, reject) => {
    if (!postId || !newPost) {
      return reject(new Error("Post ID or new post cannot be null"));
    }
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = `UPDATE Posts SET post = ? WHERE id_posts = ?`;
      connection.query(sql, [newPost, postId], (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  });
}

//! Table Comment Functions
//* SELECT
function selectComment(commentId) {
  return new Promise((resolve, reject) => {
    if (!commentId) {
      return reject(new Error("Comment ID cannot be null"));
    }
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = `SELECT * FROM comments WHERE id_comment = ?`;
      connection.query(sql, [commentId], (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  });
}

//* Select all comments from a post
function selectAllCommentsFromPost(postId) {
  return new Promise((resolve, reject) => {
    if (!postId) {
      return reject(new Error("Post ID cannot be null"));
    }
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = `SELECT * FROM comments WHERE p_id_post = ?`;
      connection.query(sql, [postId], (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  });
}

//* INSERT
function insertComment(userId, postId, comment) {
  return new Promise((resolve, reject) => {
    if (!userId || !postId || !comment) {
      return reject(new Error("User ID, post ID or comment cannot be null"));
    }
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql =
        "INSERT INTO comments (p_id_user, p_id_post, comment) VALUES (?, ?, ?)";
      connection.query(sql, [userId, postId, comment], (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  });
}

//* DELETE
function deleteComment(commentId) {
  return new Promise((resolve, reject) => {
    if (!commentId) {
      return reject(new Error("Comment ID cannot be null"));
    }
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = `DELETE FROM comments WHERE id_comment = ?`;
      connection.query(sql, [commentId], (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  });
}

//* UPDATE
function updateComment(commentId, newComment) {
  return new Promise((resolve, reject) => {
    if (!commentId || !newComment) {
      return reject(new Error("Comment ID or new comment cannot be null"));
    }
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = `UPDATE comments SET comment = ? WHERE id_comment = ?`;
      connection.query(sql, [newComment, commentId], (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  });
}

//* Export all functions
module.exports = {
  selectUser,
  selectAllUsers,
  selectUserByName,
  insertUser,
  deleteUser,
  updateUser,
  selectPost,
  selectAllPostsFromUser,
  insertPost,
  deletePost,
  updatePost,
  selectComment,
  selectAllCommentsFromPost,
  insertComment,
  deleteComment,
  updateComment,
};
