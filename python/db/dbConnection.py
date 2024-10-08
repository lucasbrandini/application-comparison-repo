# This file contains the connection to the database, and the functions to get a connection to the database.
import mysql.connector
from mysql.connector import pooling
import os
from dotenv import load_dotenv

load_dotenv()

# Create a pool of connections
pool = pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size=10,  # Maximum number of connections to create at once
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME")
)

print("\u001b[32mConnected to the database.\u001b[0m")

def get_connection():
    try:
        connection = pool.get_connection()
        return connection
    except mysql.connector.Error as err:
        print("Error connecting to database: ", err)
        return None

if __name__ == "__main__":
    conn = get_connection()
    if conn:
        print("Successfully retrieved a database connection.")
        conn.close()