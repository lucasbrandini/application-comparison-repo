from http.server import HTTPServer
from routes.getRoutes import GetRoutes
from routes.postRoutes import PostRoutes
from db.dbSetupTables import create_tables

# Cria as tabelas
create_tables()

# Cria uma nova classe que herda de PostRoutes e GetRoutes
class CombinedRoutes(PostRoutes, GetRoutes):
    pass

# Configura e inicia o servidor
httpd = HTTPServer(('localhost', 8000), CombinedRoutes)
print("Serving at port 8000")
httpd.serve_forever()