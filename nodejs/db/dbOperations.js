//! This file contains all the functions that interact with the database
const db = require("./dbConnection");

//* INSERT user with name and email and password
function insertUser(name, email, password) {
  return new Promise((resolve, reject) => {
    if (!name || !email || !password) {
      return reject(new Error("Name, email, and password cannot be null"));
    }
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = "INSERT INTO users (name_user, email, password) VALUES (?, ?, ?)";
      connection.query(sql, [name, email, password], (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(results.insertId);
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

//* Insert_post
function insertPost(userId, post_title, post) {
  return new Promise((resolve, reject) => {
    if (!userId || !post) {
      return reject(new Error("User ID or post cannot be null"));
    }
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = "INSERT INTO Posts (p_id_user, post_title, post) VALUES (?, ?, ?)";
      connection.query(sql, [userId, post_title, post], (err, results) => {
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
function insertPostWithImage(userId, post_title, post, post_image) {
  return new Promise((resolve, reject) => {
    if (!userId) {
      return reject(new Error("User ID or post cannot be null"));
    }
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = "INSERT INTO Posts (p_id_user, post_title, post, post_image) VALUES (?, ?, ?, ?)";
      connection.query(sql, [userId, post_title, post, post_image], (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  });
}

//* Insert post with video
function insertPostWithVideo(userId, post_title, post, post_video) {
  return new Promise((resolve, reject) => {
    if (!userId) {
      return reject(new Error("User ID or post cannot be null"));
    }
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = "INSERT INTO Posts (p_id_user, post_title, post, post_video) VALUES (?, ?, ?, ?)";
      connection.query(sql, [userId, post_title, post, post_video], (err, results) => {
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

//* select user by name
function selectUserByName(name) {
  return new Promise((resolve, reject) => {
    if (!name) {
      return reject(new Error("Name cannot be null"));
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

//* upvote
//* upvote
function upvote(postId, userId) {
  return new Promise((resolve, reject) => {
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      connection.beginTransaction((err) => {
        if (err) return reject(err);
        connection.query(
          "SELECT vote_type FROM votes WHERE id_user = ? AND id_post = ?",
          [userId, postId],
          (err, results) => {
            if (err) {
              connection.rollback(() => {
                connection.release();
                reject(err);
              });
            } else {
              const vote = results[0];
              if (vote) {
                if (vote.vote_type === "upvote") {
                  connection.query(
                    "DELETE FROM votes WHERE id_user = ? AND id_post = ?",
                    [userId, postId],
                    (err) => {
                      if (err) {
                        connection.rollback(() => {
                          connection.release();
                          reject(err);
                        });
                      } else {
                        connection.query(
                          "UPDATE posts SET post_votes = post_votes - 1 WHERE id_posts = ?",
                          [postId],
                          (err) => {
                            if (err) {
                              connection.rollback(() => {
                                connection.release();
                                reject(err);
                              });
                            } else {
                              connection.commit((err) => {
                                if (err) {
                                  connection.rollback(() => {
                                    connection.release();
                                    reject(err);
                                  });
                                } else {
                                  connection.release();
                                  resolve("Upvoted successfully.");
                                }
                              });
                            }
                          }
                        );
                      }
                    }
                  );
                } else {
                  connection.query(
                    "UPDATE votes SET vote_type = 'upvote' WHERE id_user = ? AND id_post = ?",
                    [userId, postId],
                    (err) => {
                      if (err) {
                        connection.rollback(() => {
                          connection.release();
                          reject(err);
                        });
                      } else {
                        connection.query(
                          "UPDATE posts SET post_votes = post_votes + 2 WHERE id_posts = ?",
                          [postId],
                          (err) => {
                            if (err) {
                              connection.rollback(() => {
                                connection.release();
                                reject(err);
                              });
                            } else {
                              connection.commit((err) => {
                                if (err) {
                                  connection.rollback(() => {
                                    connection.release();
                                    reject(err);
                                  });
                                } else {
                                  connection.release();
                                  resolve("Upvoted successfully.");
                                }
                              });
                            }
                          }
                        );
                      }
                    }
                  );
                }
              } else {
                connection.query(
                  "INSERT INTO votes (id_user, id_post, vote_type) VALUES (?, ?, 'upvote')",
                  [userId, postId],
                  (err) => {
                    if (err) {
                      connection.rollback(() => {
                        connection.release();
                        reject(err);
                      });
                    } else {
                      connection.query(
                        "UPDATE posts SET post_votes = post_votes + 1 WHERE id_posts = ?",
                        [postId],
                        (err) => {
                          if (err) {
                            connection.rollback(() => {
                              connection.release();
                              reject(err);
                            });
                          } else {
                            connection.commit((err) => {
                              if (err) {
                                connection.rollback(() => {
                                  connection.release();
                                  reject(err);
                                });
                              } else {
                                connection.release();
                                resolve("Upvoted successfully.");
                              }
                            });
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          }
        );
      });
    });
  });
}

//* downvote
function downvote(postId, userId) {
  return new Promise((resolve, reject) => {
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      connection.beginTransaction((err) => {
        if (err) return reject(err);
        connection.query(
          "SELECT vote_type FROM votes WHERE id_user = ? AND id_post = ?",
          [userId, postId],
          (err, results) => {
            if (err) {
              connection.rollback(() => {
                connection.release();
                reject(err);
              });
            } else {
              const vote = results[0];
              if (vote) {
                if (vote.vote_type === "downvote") {
                  connection.query(
                    "DELETE FROM votes WHERE id_user = ? AND id_post = ?",
                    [userId, postId],
                    (err) => {
                      if (err) {
                        connection.rollback(() => {
                          connection.release();
                          reject(err);
                        });
                      } else {
                        connection.query(
                          "UPDATE posts SET post_votes = post_votes + 1 WHERE id_posts = ?",
                          [postId],
                          (err) => {
                            if (err) {
                              connection.rollback(() => {
                                connection.release();
                                reject(err);
                              });
                            } else {
                              connection.commit((err) => {
                                if (err) {
                                  connection.rollback(() => {
                                    connection.release();
                                    reject(err);
                                  });
                                } else {
                                  connection.release();
                                  resolve("Downvoted successfully.");
                                }
                              });
                            }
                          }
                        );
                      }
                    }
                  );
                } else {
                  connection.query(
                    "UPDATE votes SET vote_type = 'downvote' WHERE id_user = ? AND id_post = ?",
                    [userId, postId],
                    (err) => {
                      if (err) {
                        connection.rollback(() => {
                          connection.release();
                          reject(err);
                        });
                      } else {
                        connection.query(
                          "UPDATE posts SET post_votes = post_votes - 2 WHERE id_posts = ?",
                          [postId],
                          (err) => {
                            if (err) {
                              connection.rollback(() => {
                                connection.release();
                                reject(err);
                              });
                            } else {
                              connection.commit((err) => {
                                if (err) {
                                  connection.rollback(() => {
                                    connection.release();
                                    reject(err);
                                  });
                                } else {
                                  connection.release();
                                  resolve("Downvoted successfully.");
                                }
                              });
                            }
                          }
                        );
                      }
                    }
                  );
                }
              } else {
                connection.query(
                  "INSERT INTO votes (id_user, id_post, vote_type) VALUES (?, ?, 'downvote')",
                  [userId, postId],
                  (err) => {
                    if (err) {
                      connection.rollback(() => {
                        connection.release();
                        reject(err);
                      });
                    } else {
                      connection.query(
                        "UPDATE posts SET post_votes = post_votes - 1 WHERE id_posts = ?",
                        [postId],
                        (err) => {
                          if (err) {
                            connection.rollback(() => {
                              connection.release();
                              reject(err);
                            });
                          } else {
                            connection.commit((err) => {
                              if (err) {
                                connection.rollback(() => {
                                  connection.release();
                                  reject(err);
                                });
                              } else {
                                connection.release();
                                resolve("Downvoted successfully.");
                              }
                            });
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          }
        );
      });
    });
  });
}

//* get_post
function getPost(postId) {
  return new Promise((resolve, reject) => {
    if (!postId) {
      return reject(new Error("Post ID cannot be null"));
    }
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = `SELECT * FROM posts WHERE id_posts = ?`;
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

//* find_vote
function findVote(userId) {
  return new Promise((resolve, reject) => {
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = `
        SELECT 
          p.id_posts, 
          p.post, 
          p.post_date, 
          p.post_votes, 
          COALESCE(v.vote_type, 'no vote') AS user_vote 
        FROM 
          posts p 
        LEFT JOIN 
          (SELECT * FROM votes WHERE id_user = ?) v 
        ON 
          p.id_posts = v.id_post 
        ORDER BY 
          p.post_date
      `;
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

//* change_username
function changeUsername(user_id, new_name) {
  return new Promise((resolve, reject) => {
    if (!user_id || !new_name) {
      return reject(new Error("User ID or new name cannot be null"));
    }

    db.getConnection((err, connection) => {
      if (err) return reject(err);
      connection.beginTransaction((err) => {
        if (err) return reject(err);
        const sql_check = "SELECT * FROM users WHERE name_user = ?";
        connection.query(sql_check, [new_name], (err, results) => {
          if (err) {
            connection.rollback(() => {
              connection.release();
              reject(err);
            });
          } else {
            const existing_user = results[0];
            if (existing_user) {
              resolve("Username already exists.");
            } else {
              const sql_update = "UPDATE users SET name_user = ? WHERE id_user = ?";
              connection.query(sql_update, [new_name, user_id], (err) => {
                if (err) {
                  connection.rollback(() => {
                    connection.release();
                    reject(err);
                  });
                } else {
                  connection.commit((err) => {
                    if (err) {
                      connection.rollback(() => {
                        connection.release();
                        reject(err);
                      });
                    } else {
                      connection.release();
                      resolve("Username updated successfully.");
                    }
                  });
                }
              });
            }
          }
        });
      });
    });
  });
}

//* Select all posts ordered by date
function selectAllPostsOrdered() {
  return new Promise((resolve, reject) => {
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = `
        SELECT 
          u.name_user, 
          uv.avatar_image,
          p.id_posts,
          p.p_id_user,
          p.post_title,
          p.post, 
          p.post_image, 
          p.post_video, 
          p.post_votes,
          COUNT(c.id_comment) AS comment_count,
          CASE 
              WHEN TIMESTAMPDIFF(SECOND, p.post_date, NOW()) < 60 THEN CONCAT(TIMESTAMPDIFF(SECOND, p.post_date, NOW()), 's') 
              WHEN TIMESTAMPDIFF(MINUTE, p.post_date, NOW()) < 60 THEN CONCAT(TIMESTAMPDIFF(MINUTE, p.post_date, NOW()), 'min') 
              WHEN TIMESTAMPDIFF(HOUR, p.post_date, NOW()) < 24 THEN CONCAT(TIMESTAMPDIFF(HOUR, p.post_date, NOW()), 'h') 
              WHEN TIMESTAMPDIFF(DAY, p.post_date, NOW()) < 7 THEN CONCAT(TIMESTAMPDIFF(DAY, p.post_date, NOW()), 'd') 
              WHEN TIMESTAMPDIFF(WEEK, p.post_date, NOW()) < 4 THEN CONCAT(TIMESTAMPDIFF(WEEK, p.post_date, NOW()), 'w') 
              ELSE CONCAT(TIMESTAMPDIFF(MONTH, p.post_date, NOW()), 'm') 
          END AS post_date 
        FROM posts p 
        JOIN users u 
        ON p.p_id_user = u.id_user 
        JOIN users_avatar uv
        ON uv.id_user = u.id_user
        LEFT JOIN comments c
        ON c.p_id_post = p.id_posts
        GROUP BY 
          p.id_posts,
          u.name_user, 
          uv.avatar_image,
          p.p_id_user,
          p.post_title,
          p.post, 
          p.post_image, 
          p.post_video, 
          p.post_votes
        ORDER BY 
          p.post_date DESC
      `;
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

//* insert users_avatar
function insertAvatar(user_id, avatar_image) {
  return new Promise((resolve, reject) => {
    if (!user_id || !avatar_image) {
      return reject(new Error("User ID or avatar image cannot be null"));
    }
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = "INSERT INTO users_avatar (id_user, avatar_image) VALUES (?, ?)";
      connection.query(sql, [user_id, avatar_image], (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(results.insertId);
      });
    });
  });
}

//* update post with image
function updatePostImage(post_id, post_title, post, image) {
  return new Promise((resolve, reject) => {
    if (!post_id) {
      return reject(new Error("Post ID cannot be null"));
    }
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = "UPDATE posts SET post_title = ?, post = ?, post_image = ?, post_video = null WHERE id_posts = ?";
      connection.query(sql, [post_title, post, image, post_id], (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve("Post updated successfully.");
      });
    });
  });
}

//* update post with video
function updatePostVideo(post_id, post_title, post, video) {
  return new Promise((resolve, reject) => {
    if (!post_id) {
      return reject(new Error("Post ID cannot be null"));
    }
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = "UPDATE posts SET post_title = ?, post = ?, post_image = null, post_video = ? WHERE id_posts = ?";
      connection.query(sql, [post_title, post, video, post_id], (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve("Post updated successfully.");
      });
    });
  });
}

//* get comments by post_id
function getCommentsByPostId(post_id) {
  return new Promise((resolve, reject) => {
    if (!post_id) {
      return reject(new Error("Post ID cannot be null"));
    }
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = "SELECT * FROM comments WHERE p_id_post = ?";
      connection.query(sql, [post_id], (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  });
}

//* insert_comment
function insertComment(user_id, post_id, comment) {
  return new Promise((resolve, reject) => {
    if (!user_id || !post_id || !comment) {
      return reject(new Error("User ID, post ID or comment cannot be null"));
    }
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = "INSERT INTO comments (p_id_user, p_id_post, comment) VALUES (?, ?, ?)";
      connection.query(sql, [user_id, post_id, comment], (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(results.insertId);
      });
    });
  });
}

//* edit_comment_by_author
function editCommentByAuthor(comment, user_id, post_id, comment_id) {
  return new Promise((resolve, reject) => {
    try {
      comment_id = parseInt(comment_id);
      user_id = parseInt(user_id);
      post_id = parseInt(post_id);
    } catch (error) {
      throw new Error("Comment ID, user ID, and post ID must be integers");
    }

    db.getConnection((err, connection) => {
      if (err) return reject(err);
      connection.beginTransaction((err) => {
        if (err) return reject(err);
        const sql = `
          UPDATE comments 
          SET comment = ?,
              p_id_user = ?,
              p_id_post = ? 
          WHERE id_comment = ? 
        `;
        connection.query(sql, [comment, user_id, post_id, comment_id], (err) => {
          if (err) {
            connection.rollback(() => {
              connection.release();
              reject(err);
            });
          } else {
            connection.commit((err) => {
              if (err) {
                connection.rollback(() => {
                  connection.release();
                  reject(err);
                });
              } else {
                connection.release();
                resolve("Comment updated successfully.");
              }
            });
          }
        });
      });
    });
  });
}

//* delete_comment_by_author
function deleteCommentByAuthor(comment_id) {
  return new Promise((resolve, reject) => {
    if (!comment_id) {
      return reject(new Error("Comment ID cannot be null"));
    }
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = "DELETE FROM comments WHERE id_comment = ?";
      connection.query(sql, [comment_id], (err) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

//* Select avatar by user_id
function selectAvatar(user_id) {
  return new Promise((resolve, reject) => {
    if (!user_id) {
      return reject(new Error("User ID cannot be null"));
    }
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = "SELECT * FROM users_avatar WHERE id_user = ?";
      connection.query(sql, [user_id], (err, results) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(results[0]);
      });
    });
  });
}

//* update avatar by user_id
function updateAvatar(user_id, avatar_image) {
  return new Promise((resolve, reject) => {
    if (!user_id || !avatar_image) {
      return reject(new Error("User ID or avatar image cannot be null"));
    }
    db.getConnection((err, connection) => {
      if (err) return reject(err);
      const sql = "UPDATE users_avatar SET avatar_image = ? WHERE id_user = ?";
      connection.query(sql, [avatar_image, user_id], (err) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve("Avatar updated successfully.");
      });
    });
  });
}


//* Export all functions
module.exports = {
  insertUser,
  deleteUser,
  insertPost,
  insertPostWithImage,
  insertPostWithVideo,
  deletePost,
  selectUserByName,
  deleteComment,
  upvote,
  downvote,
  getPost,
  findVote,
  changeUsername,
  selectAllPostsOrdered,
  insertAvatar,
  updatePostImage,
  updatePostVideo,
  getCommentsByPostId,
  insertComment,
  editCommentByAuthor,
  deleteCommentByAuthor,
  selectAvatar,
  updateAvatar,
};
