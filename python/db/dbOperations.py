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
        sql = "SELECT * FROM users WHERE id_user = %s"
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
        sql = "SELECT * FROM users"
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
        sql = "INSERT INTO users (name_user, password) VALUES (%s, %s)"
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
        sql = "UPDATE users SET name_user = %s, password = %s WHERE id_user = %s"
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
        sql = "DELETE FROM users WHERE id_user = %s"
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
        sql = "SELECT * FROM posts WHERE id_posts = %s"
        cursor.execute(sql, (post_id,))
        results = cursor.fetchall()
        return results
    finally:
        cursor.close()
        connection.close()

# Select all posts
def select_all_posts():
    connection = get_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        sql = "SELECT post, post_image FROM Posts"
        cursor.execute(sql)
        results = cursor.fetchall()
        return results
    finally:
        cursor.close()
        connection.close()


# Insert
def insert_post(user_id, post_title, post):
    if not user_id or not post:
        raise ValueError("User ID or post cannot be null")

    connection = get_connection()
    try:
        cursor = connection.cursor()
        sql = "INSERT INTO posts (p_id_user, post_title, post) VALUES (%s, %s, %s)"
        cursor.execute(sql, (user_id, post_title, post))
        connection.commit()
        return cursor.lastrowid
    finally:
        cursor.close()
        connection.close()

# Insert post with image
def insert_post_image(user_id, post_title, post, image):
    if not user_id:
        raise ValueError("User ID or post cannot be null")

    connection = get_connection()
    try:
        cursor = connection.cursor()
        sql = "INSERT INTO posts (p_id_user, post_title, post, post_image) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql, (user_id, post_title, post, image))
        connection.commit()
        return cursor.lastrowid
    finally:
        cursor.close()
        connection.close()

# Insert post with video
def insert_post_video(user_id, post_title, post, video):
    if not user_id:
        raise ValueError("User ID or post cannot be null")

    connection = get_connection()
    try:
        cursor = connection.cursor()
        sql = "INSERT INTO posts (p_id_user, post_title, post, post_video) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql, (user_id, post_title, post, video))
        connection.commit()
        return cursor.lastrowid
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
        sql = "DELETE FROM posts WHERE id_posts = %s"
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
        sql = "SELECT * FROM users WHERE name_user = %s"
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
        sql = "SELECT * FROM comments WHERE id_comment = %s"
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
        sql = "INSERT INTO comments (p_id_user, p_id_post, comment) VALUES (%s, %s, %s)"
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
        sql = "UPDATE comments SET p_id_user = %s, p_id_post = %s, comment = %s WHERE id_comment = %s"
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
        sql = "DELETE FROM comments WHERE id_comment = %s"
        cursor.execute(sql, (comment_id,))
        connection.commit()
    finally:
        cursor.close()
        connection.close()


def upvote(post_id, user_id):
    connection = get_connection()
    try:
        cursor = connection.cursor()

        # Verificar se o usuário já votou no post
        sql_check = "SELECT vote_type FROM votes WHERE id_user = %s AND id_post = %s"
        cursor.execute(sql_check, (user_id, post_id))
        vote = cursor.fetchone()

        if vote:
            if vote[0] == 'upvote':
                # Remover upvote
                sql_delete_vote = "DELETE FROM votes WHERE id_user = %s AND id_post = %s"
                cursor.execute(sql_delete_vote, (user_id, post_id))
                sql_update_post = "UPDATE posts SET post_votes = post_votes - 1 WHERE id_posts = %s"
                cursor.execute(sql_update_post, (post_id,))
            else:
                # Alterar downvote para upvote
                sql_update_vote = "UPDATE votes SET vote_type = 'upvote' WHERE id_user = %s AND id_post = %s"
                cursor.execute(sql_update_vote, (user_id, post_id))
                sql_update_post = "UPDATE posts SET post_votes = post_votes + 2 WHERE id_posts = %s"
                cursor.execute(sql_update_post, (post_id,))
        else:
            # Inserir novo upvote
            sql_insert_vote = "INSERT INTO votes (id_user, id_post, vote_type) VALUES (%s, %s, 'upvote')"
            cursor.execute(sql_insert_vote, (user_id, post_id))
            sql_update_post = "UPDATE posts SET post_votes = post_votes + 1 WHERE id_posts = %s"
            cursor.execute(sql_update_post, (post_id,))

        connection.commit()
        return "Upvoted successfully."
    finally:
        cursor.close()
        connection.close()

def downvote(post_id, user_id):
    connection = get_connection()
    try:
        cursor = connection.cursor()

        # Verificar se o usuário já votou no post
        sql_check = "SELECT vote_type FROM votes WHERE id_user = %s AND id_post = %s"
        cursor.execute(sql_check, (user_id, post_id))
        vote = cursor.fetchone()

        if vote:
            if vote[0] == 'downvote':
                # Remover downvote
                sql_delete_vote = "DELETE FROM votes WHERE id_user = %s AND id_post = %s"
                cursor.execute(sql_delete_vote, (user_id, post_id))
                sql_update_post = "UPDATE posts SET post_votes = post_votes + 1 WHERE id_posts = %s"
                cursor.execute(sql_update_post, (post_id,))
            else:
                # Alterar upvote para downvote
                sql_update_vote = "UPDATE votes SET vote_type = 'downvote' WHERE id_user = %s AND id_post = %s"
                cursor.execute(sql_update_vote, (user_id, post_id))
                sql_update_post = "UPDATE posts SET post_votes = post_votes - 2 WHERE id_posts = %s"
                cursor.execute(sql_update_post, (post_id,))
        else:
            # Inserir novo downvote
            sql_insert_vote = "INSERT INTO votes (id_user, id_post, vote_type) VALUES (%s, %s, 'downvote')"
            cursor.execute(sql_insert_vote, (user_id, post_id))
            sql_update_post = "UPDATE posts SET post_votes = post_votes - 1 WHERE id_posts = %s"
            cursor.execute(sql_update_post, (post_id,))

        connection.commit()
        return "Downvoted successfully."
    finally:
        cursor.close()
        connection.close()
        
def get_post(post_id):
    connection = get_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        sql = "SELECT * FROM posts WHERE id_posts = %s"
        cursor.execute(sql, (post_id,))
        result = cursor.fetchone()
        return result
    finally:
        cursor.close()
        connection.close()
        
def edit_post(post_id, post):
    if not post_id or not post:
        raise ValueError("Post ID or post cannot be null")

    connection = get_connection()
    try:
        cursor = connection.cursor()
        sql = "UPDATE posts SET post = %s WHERE id_posts = %s"
        cursor.execute(sql, (post, post_id))
        connection.commit()
        return "Post updated successfully."
    finally:
        cursor.close()
        connection.close()

def find_vote(user_id):
    connection = get_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        sql_find_vote = """
            SELECT 
                p.id_posts, 
                p.post, 
                p.post_date, 
                p.post_votes, 
                COALESCE(v.vote_type, 'no vote') AS user_vote 
            FROM 
                posts p 
            LEFT JOIN 
                (SELECT * FROM votes WHERE id_user = %s) v 
            ON 
                p.id_posts = v.id_post 
            ORDER BY 
                p.post_date
        """
        cursor.execute(sql_find_vote, (user_id,))
        results = cursor.fetchall()
        return results
    except Exception as e:
        print(f"Error: {e}")
    finally:
        cursor.close()
        connection.close()
        
def change_username(user_id, new_name):
    if not user_id or not new_name:
        raise ValueError("User ID or new name cannot be null")

    connection = get_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        # Verifica se o novo nome já existe
        sql_check = "SELECT * FROM users WHERE name_user = %s"
        cursor.execute(sql_check, (new_name,))
        existing_user = cursor.fetchone()

        if existing_user:
            return "Username already exists."

        # Atualiza o nome do usuário
        sql_update = "UPDATE users SET name_user = %s WHERE id_user = %s"
        cursor.execute(sql_update, (new_name, user_id))
        connection.commit()
        return "Username updated successfully."
    finally:
        cursor.close()
        connection.close()

def select_all_posts_ordered():
    connection = get_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        sql = """
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
                CASE 
                    WHEN TIMESTAMPDIFF(SECOND, p.post_date, NOW()) < 60 THEN CONCAT(TIMESTAMPDIFF(SECOND, p.post_date, NOW()), 's') 
                    WHEN TIMESTAMPDIFF(MINUTE, p.post_date, NOW()) < 60 THEN CONCAT(TIMESTAMPDIFF(MINUTE, p.post_date, NOW()), 'min') 
                    WHEN TIMESTAMPDIFF(HOUR, p.post_date, NOW()) < 24 THEN CONCAT(TIMESTAMPDIFF(HOUR, p.post_date, NOW()), 'h') 
                    WHEN TIMESTAMPDIFF(DAY, p.post_date, NOW()) < 7 THEN CONCAT(TIMESTAMPDIFF(DAY, p.post_date, NOW()), 'd') 
                    WHEN TIMESTAMPDIFF(WEEK, p.post_date, NOW()) < 4 THEN CONCAT(TIMESTAMPDIFF(WEEK, p.post_date, NOW()), 'w') 
                    ELSE CONCAT(TIMESTAMPDIFF(MONTH, p.post_date, NOW()), 'm') 
                END AS post_date 
            FROM 
                posts p 
            JOIN 
                users u 
            ON 
                p.p_id_user = u.id_user 
            JOIN
				users_avatar uv
			ON
				uv.id_user = u.id_user
			
            ORDER BY 
                p.post_date DESC
        """
        cursor.execute(sql)
        results = cursor.fetchall()
        return results
    finally:
        cursor.close()
        connection.close()

#insert users_avatar
def insert_avatar(user_id, avatar_image):
    if not user_id or not avatar_image:
        raise ValueError("User ID or avatar image cannot be null")

    connection = get_connection()
    try:
        cursor = connection.cursor()
        sql = "INSERT INTO users_avatar (id_user, avatar_image) VALUES (%s, %s)"
        cursor.execute(sql, (user_id, avatar_image))
        connection.commit()
        return cursor.lastrowid
    finally:
        cursor.close()
        connection.close()

#update post with image
def update_post_image(post_id, post_title, post, image):
    if not post_id:
        raise ValueError("Post ID cannot be null")
    connection = get_connection()
    try:
        cursor = connection.cursor()
        sql = "UPDATE posts SET post_title = %s, post = %s, post_image = %s, post_video = null WHERE id_posts = %s"
        cursor.execute(sql, (post_title, post, image, post_id))
        connection.commit()
        return "Post updated successfully."
    finally:
        cursor.close()
        connection.close()
#update post with video
def update_post_video(post_id, post_title, post, video):
    if not post_id:
        raise ValueError("Post ID cannot be null")
    connection = get_connection()
    try:
        cursor = connection.cursor()
        sql = "UPDATE posts SET post_title = %s, post = %s,post_image = null , post_video = %s WHERE id_posts = %s"
        cursor.execute(sql, (post_title, post, video, post_id))
        connection.commit()
        return "Post updated successfully."
    finally:
        cursor.close()
        connection.close()

