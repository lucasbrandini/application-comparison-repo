from http.server import HTTPServer
from routes.getRoutes import GetRoutes
from routes.postRoutes import PostRoutes
from db.dbSetupTables import create_tables

# Cria as tabelas no banco de dados
create_tables()

# Configura e inicia o servidor
httpd = HTTPServer(('localhost', 8000), GetRoutes)
print("Serving at port 8000")
httpd.serve_forever()