# This file contains all the functions that interact with the database
from db.dbConnection import get_connection
import bcrypt
#! Users
# Select
def select_user(user_id):
    if not user_id:
        raise ValueError("User ID cannot be null")
    
    connection = get_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        sql = "SELECT * FROM Usuarios WHERE id_user = %s"
        cursor.execute(sql, (user_id,))
        results = cursor.fetchall()
        return results
    finally:
        cursor.close()
        connection.close()
# Select all users
def select_all_users():
    connection = get_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        sql = "SELECT * FROM Usuarios"
        cursor.execute(sql)
        results = cursor.fetchall()
        return results
    finally:
        cursor.close()
        connection.close()
# Insert
def insert_user(name, password):
    print(name, password)
    if not name or not password:
        raise ValueError("Name or password cannot be null")

    connection = get_connection()
    try:
        cursor = connection.cursor()
        sql = "INSERT INTO Usuarios (name_user, password) VALUES (%s, %s)"
        cursor.execute(sql, (name, password))
        connection.commit()
        return cursor.lastrowid
    finally:
        cursor.close()
        connection.close()
# Update
def update_user(user_id, name, password):
    if not user_id or not name or not password:
        raise ValueError("User ID, name or password cannot be null")

    connection = get_connection()
    try:
        cursor = connection.cursor()
        sql = "UPDATE Usuarios SET name_user = %s, password = %s WHERE id_user = %s"
        cursor.execute(sql, (name, password, user_id))
        connection.commit()
    finally:
        cursor.close()
        connection.close()
# Delete
def delete_user(user_id):
    if not user_id:
        raise ValueError("User ID cannot be null")

    connection = get_connection()
    try:
        cursor = connection.cursor()
        sql = "DELETE FROM Usuarios WHERE id_user = %s"
        cursor.execute(sql, (user_id,))
        connection.commit()
    finally:
        cursor.close()
        connection.close()
#! Posts
# Select
def select_post(post_id):
    if not post_id:
        raise ValueError("Post ID cannot be null")

    connection = get_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        sql = "SELECT * FROM Posts WHERE id_posts = %s"
        cursor.execute(sql, (post_id,))
        results = cursor.fetchall()
        return results
    finally:
        cursor.close()
        connection.close()
# Insert
def insert_post(user_id, post):
    if not user_id or not post:
        raise ValueError("User ID or post cannot be null")

    connection = get_connection()
    try:
        cursor = connection.cursor()
        sql = "INSERT INTO Posts (p_id_user, post) VALUES (%s, %s)"
        cursor.execute(sql, (user_id, post))
        connection.commit()
        return cursor.lastrowid
    finally:
        cursor.close()
        connection.close()
# Update
def update_post(post_id, user_id, post):
    if not post_id or not user_id or not post:
        raise ValueError("Post ID, user ID or post cannot be null")

    connection = get_connection()
    try:
        cursor = connection.cursor()
        sql = "UPDATE Posts SET p_id_user = %s, post = %s WHERE id_posts = %s"
        cursor.execute(sql, (user_id, post, post_id))
        connection.commit()
    finally:
        cursor.close()
        connection.close()  
# Delete
def delete_post(post_id):
    if not post_id:
        raise ValueError("Post ID cannot be null")

    connection = get_connection()
    try:
        cursor = connection.cursor()
        sql = "DELETE FROM Posts WHERE id_posts = %s"
        cursor.execute(sql, (post_id,))
        connection.commit()
    finally:
        cursor.close()
        connection.close()
#! Comments
def select_user_by_name(name):
    if not name:
        raise ValueError("Name cannot be null")

    connection = get_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        sql = "SELECT * FROM Usuarios WHERE name_user = %s"
        cursor.execute(sql, (name,))
        result = cursor.fetchone()
        return result
    finally:
        cursor.close()
        connection.close()
# Select
def select_comment(comment_id):
    if not comment_id:
        raise ValueError("Comment ID cannot be null")

    connection = get_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        sql = "SELECT * FROM Comentarios WHERE id_comment = %s"
        cursor.execute(sql, (comment_id,))
        results = cursor.fetchall()
        return results
    finally:
        cursor.close()
        connection.close()
# Insert
def insert_comment(user_id, post_id, comment):
    if not user_id or not post_id or not comment:
        raise ValueError("User ID, post ID or comment cannot be null")

    connection = get_connection()
    try:
        cursor = connection.cursor()
        sql = "INSERT INTO Comentarios (p_id_user, p_id_post, comment) VALUES (%s, %s, %s)"
        cursor.execute(sql, (user_id, post_id, comment))
        connection.commit()
        return cursor.lastrowid
    finally:
        cursor.close()
        connection.close()
# Update
def update_comment(comment_id, user_id, post_id, comment):
    if not comment_id or not user_id or not post_id or not comment:
        raise ValueError("Comment ID, user ID, post ID or comment cannot be null")

    connection = get_connection()
    try:
        cursor = connection.cursor()
        sql = "UPDATE Comentarios SET p_id_user = %s, p_id_post = %s, comment = %s WHERE id_comment = %s"
        cursor.execute(sql, (user_id, post_id, comment, comment_id))
        connection.commit()
    finally:
        cursor.close()
        connection.close()
# Delete
def delete_comment(comment_id):
    if not comment_id:
        raise ValueError("Comment ID cannot be null")

    connection = get_connection()
    try:
        cursor = connection.cursor()
        sql = "DELETE FROM Comentarios WHERE id_comment = %s"
        cursor.execute(sql, (comment_id,))
        connection.commit()
    finally:
        cursor.close()
        connection.close()



