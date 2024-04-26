from http.server import HTTPServer
from routes.getRoutes import GetRoutes
from routes.postRoutes import PostRoutes

# Configura e inicia o servidor
httpd = HTTPServer(('localhost', 8000), GetRoutes)
print("Serving at port 8000")
httpd.serve_forever()