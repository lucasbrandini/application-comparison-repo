from http.server import HTTPServer, BaseHTTPRequestHandler
from pybars import Compiler
import os

# Compilador Handlebars
compiler = Compiler()

# Definindo uma variável que será passada para o template
data = {
    'nome': 'Mundo',
    'number': 10
}

# Lendo o arquivo de template Handlebars
with open('template.hbs', 'r') as file:
    source = file.read()

# Compilando o template
template = compiler.compile(source)

# Renderizando o template handlebars com a variável
output = template(data)

class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(output.encode())

httpd = HTTPServer(('localhost', 8000), SimpleHTTPRequestHandler)
httpd.serve_forever()