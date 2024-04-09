import mysql.connector
from mysql.connector import errorcode
import os

def connect_database():
    config = {
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', '123456'),
        'host': os.getenv('DB_HOST', 'localhost'),
        'database': os.getenv('DB_NAME', 'mydb'),
        'raise_on_warnings': True
    }

    try:
        cnx = mysql.connector.connect(**config)
        cursor = cnx.cursor()

        TABLES = {}
        TABLES['Usuarios'] = (
            "CREATE TABLE Usuarios ("
            "  id_user INT AUTO_INCREMENT PRIMARY KEY,"
            "  name_user VARCHAR(255) NOT NULL,"
            "  password VARCHAR(255) NOT NULL,"
            "  create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
            ") ENGINE=InnoDB")

        TABLES['Posts'] = (
            "CREATE TABLE Posts ("
            "  id_posts INT AUTO_INCREMENT PRIMARY KEY,"
            "  p_id_user INT,"
            "  post VARCHAR(1024) NOT NULL,"
            "  post_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"
            "  FOREIGN KEY (p_id_user) REFERENCES Usuarios(id_user)"
            ") ENGINE=InnoDB")

        TABLES['Comentarios'] = (
            "CREATE TABLE Comentarios ("
            "  id_comment INT AUTO_INCREMENT PRIMARY KEY,"
            "  p_id_user INT,"
            "  p_id_post INT,"
            "  comment VARCHAR(512) NOT NULL,"
            "  comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"
            "  FOREIGN KEY (p_id_user) REFERENCES Usuarios(id_user),"
            "  FOREIGN KEY (p_id_post) REFERENCES Posts(id_posts)"
            ") ENGINE=InnoDB")

        for table_name in TABLES:
            table_description = TABLES[table_name]
            try:
                print("Creating table {}: ".format(table_name), end='')
                cursor.execute(table_description)
            except mysql.connector.Error as err:
                if err.errno == errorcode.ER_TABLE_EXISTS_ERROR:
                    print("already exists.")
                else:
                    print(err.msg)
            else:
                print("OK")

        cursor.close()
        cnx.close()

    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("Something is wrong with your user name or password")
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            print("Database does not exist")
        else:
            print(err)

if __name__ == "__main__":
    connect_database()