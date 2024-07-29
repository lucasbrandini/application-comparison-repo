from http.server import HTTPServer
from routes.routesGet import routesGet
from routes.routesPost import routesPost
from routes.routesDelete import routesDelete
from routes.routesPut import routesPut
from db.dbSetupTables import create_tables

# Cria as tabelas
create_tables()

# Cria uma nova classe que herda de PostRoutes e GetRoutes
class CombinedRoutes(routesPost, routesGet, routesDelete, routesPut):
    pass

# Configura e inicia o servidor
httpd = HTTPServer(('localhost', 8000), CombinedRoutes)
print("Serving at port 8000, access http://localhost:8000/register")

try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\nServer stopped by user")
    httpd.server_close()