from db.dbConnection import get_connection

def create_tables():
    connection = get_connection()
    if connection is None:
        print("Failed to get database connection")
        return

    cursor = connection.cursor()

    table_definitions = [
        {
            "tableName": "Usuarios",
            "columns": """
                id_user INT AUTO_INCREMENT PRIMARY KEY,
                name_user VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            """
        },
        {
            "tableName": "Avatar_Images",
            "columns": """
                id_imageAv INT AUTO_INCREMENT PRIMARY KEY,
                image BLOB NOT NULL,
                date_av TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            """
        },
        {
            "tableName": "Avatar",
            "columns": """
                id_avatar INT AUTO_INCREMENT PRIMARY KEY,
                id_user INT,
                id_imageAv INT,
                date_insert TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (id_user) REFERENCES Usuarios(id_user),
                FOREIGN KEY (id_imageAv) REFERENCES Avatar_Images(id_imageAv)
            """
        },
        {
            "tableName": "post_images",
            "columns": """
                id INT AUTO_INCREMENT PRIMARY KEY,
                image BLOB NOT NULL,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            """
        },
        {
            "tableName": "Posts",
            "columns": """
                id_posts INT AUTO_INCREMENT PRIMARY KEY,
                p_id_user INT,
                post VARCHAR(1024) NOT NULL,
                post_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (p_id_user) REFERENCES Usuarios(id_user)
            """
        },
        {
            "tableName": "relat_post_images",
            "columns": """
                id_rel INT AUTO_INCREMENT PRIMARY KEY,
                id_post INT,
                id_image INT,
                FOREIGN KEY (id_post) REFERENCES Posts(id_posts),
                FOREIGN KEY (id_image) REFERENCES post_images(id)
            """
        },
        {
            "tableName": "Comentarios",
            "columns": """
                id_comment INT AUTO_INCREMENT PRIMARY KEY,
                p_id_user INT,
                p_id_post INT,
                comment VARCHAR(512) NOT NULL,
                comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (p_id_user) REFERENCES Usuarios(id_user),
                FOREIGN KEY (p_id_post) REFERENCES Posts(id_posts)
            """
        },
    ]


    try:
        for table in table_definitions:
            sql = f"CREATE TABLE IF NOT EXISTS {table['tableName']} ({table['columns']})"
            cursor.execute(sql)
            print(f"Table {table['tableName']} created successfully.")
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
