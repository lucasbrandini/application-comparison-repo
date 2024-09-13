from http.server import HTTPServer, BaseHTTPRequestHandler
from routes.routesGet import routesGet
from routes.routesPost import routesPost
from routes.routesDelete import routesDelete
from routes.routesPut import routesPut
from db.dbSetupTables import create_tables
import requests

# Cria as tabelas
create_tables()

# Cria uma nova classe que herda de PostRoutes e GetRoutes
class CombinedRoutes(routesPost, routesGet, routesDelete, routesPut):
    pass

class MemoryMonitorHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/memory':
            response = requests.get('http://localhost:3000/memory')
            self.send_response(response.status_code)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(response.content)
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Not Found')

# Configura e inicia o servidor
httpd = HTTPServer(('localhost', 8000), CombinedRoutes)
memory_monitor_server = HTTPServer(('localhost', 8001), MemoryMonitorHandler)

print("\u001b[36;1mServing at port 8000, access http://localhost:8000/register\u001b[0m")
print("\u001b[36;1mMemory monitor proxy running at http://localhost:8001/memory\u001b[0m")

try:
    from threading import Thread
    Thread(target=httpd.serve_forever).start()
    Thread(target=memory_monitor_server.serve_forever).start()
except KeyboardInterrupt:
    print("\nServer stopped by user")
    httpd.server_close()
    memory_monitor_server.server_close()