from http.server import HTTPServer
from routes.routesGet import routesGet
from routes.routesPost import routesPost
from db.dbSetupTables import create_tables
import ssl

create_tables()

class CombinedRoutes(routesPost, routesGet):
    pass

httpd = HTTPServer(('0.0.0.0', 9005), CombinedRoutes)

context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain(certfile='/etc/letsencrypt/archive/lucascriado.com-0001/fullchain2.pem', keyfile='/etc/letsencrypt/archive/lucascriado.com-0001/privkey2.pem')

httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

print("Serving at port 9005, access https://lucascriado.com/register")

try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\nServer stopped by user")
    httpd.server_close()

