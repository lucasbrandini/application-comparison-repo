from http.server import HTTPServer
from routes.routesGet import routesGet
from routes.routesPost import routesPost
from db.dbSetupTables import create_tables
import ssl

# Cria as tabelas
create_tables()

# Cria uma nova classe que herda de PostRoutes e GetRoutes
class CombinedRoutes(routesPost, routesGet):
    pass

# Configura e inicia o servidor
httpd = HTTPServer(('localhost', 9005), CombinedRoutes)

# Configurações SSL
httpd.socket = ssl.wrap_socket(
    httpd.socket,
    keyfile='/etc/letsencrypt/archive/lucascriado.com-0001/privkey2.pem',
    certfile='/etc/letsencrypt/archive/lucascriado.com-0001/fullchain2.pem',
    server_side=True
)

print("Serving at port 9005, access https://localhost:9005/register")

try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\nServer stopped by user")
    httpd.server_close()
