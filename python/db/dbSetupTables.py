from db.dbConnection import get_connection

def create_tables():
    connection = get_connection()
    if connection is None:
        print("Failed to get database connection")
        return

    cursor = connection.cursor()

    table_definitions = [
        {
            "tableName": "users",
            "columns": """
            id_user INT AUTO_INCREMENT PRIMARY KEY,
            name_user VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            """
        },
        {
            "tableName": "users_avatar",
            "columns": """
            id_avatar INT AUTO_INCREMENT PRIMARY KEY,
            id_user INT,
            avatar_image LONGBLOB,
            date_insert TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_user) REFERENCES users(id_user)
            """
        },
        {
            "tableName": "posts",
            "columns": """
            id_posts INT AUTO_INCREMENT PRIMARY KEY,
            p_id_user INT,
            post_title VARCHAR(196),
            post VARCHAR(1024),
            post_image LONGBLOB,
            post_video LONGBLOB,
            post_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            post_votes INT DEFAULT 0,
            FOREIGN KEY (p_id_user) REFERENCES users(id_user)
            """
        },
        {
            "tableName": "comments",
            "columns": """
            id_comment INT AUTO_INCREMENT PRIMARY KEY,
            p_id_user INT,
            p_id_post INT,
            comment VARCHAR(512) NOT NULL,
            comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (p_id_user) REFERENCES users(id_user),
            FOREIGN KEY (p_id_post) REFERENCES posts(id_posts)
            """
        },
        {
            "tableName": "votes",
            "columns": """
            id_vote INT AUTO_INCREMENT PRIMARY KEY,
            id_user INT,
            id_post INT,
            vote_type ENUM('upvote', 'downvote'),
            vote_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_user) REFERENCES users(id_user),
            FOREIGN KEY (id_post) REFERENCES posts(id_posts),
            UNIQUE KEY unique_vote (id_user, id_post)
            """
        }
    ]

    try:
        # Create tables
        for table in table_definitions:
            sql = f"CREATE TABLE IF NOT EXISTS {table['tableName']} ({table['columns']})"
            cursor.execute(sql)
            print(f"Table {table['tableName']} created successfully.")
        
        # Create trigger
        trigger_sql = """
        CREATE TRIGGER before_post_delete
        BEFORE DELETE ON posts
        FOR EACH ROW
        BEGIN
            DELETE FROM comments WHERE p_id_post = OLD.id_posts;
        END
        """
        cursor.execute(trigger_sql)
        print("Trigger before_post_delete created successfully.")
        
        connection.commit()
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection is closed")

if __name__ == "__main__":
    create_tables()
