from http.server import HTTPServer
from routes.routesGet import routesGet
from routes.routesPost import routesPost
from routes.routesDelete import routesDelete
from routes.routesPut import routesPut
from db.dbSetupTables import create_tables

create_tables()

# Cria uma nova classe que herda de PostRoutes e GetRoutes
class CombinedRoutes(routesPost, routesGet, routesDelete, routesPut):
    pass

httpd = HTTPServer(('localhost', 8000), CombinedRoutes)
print("\u001b[36;1mServing at port 8000, access http://localhost:8000/register\u001b[0m")

try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\nServer stopped by user")
    httpd.server_close()