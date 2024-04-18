import sys
import os
import json
import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from pybars import Compiler

# Configure o caminho para o módulo dbOperations, dbSetupTables
sys.path.append(os.path.join(os.path.dirname(__file__), './db'))
from dbOperations import select_user, select_all_users, insert_user, update_user, delete_user, insert_post, update_post, delete_post, select_post, insert_comment, update_comment, delete_comment, select_comment
from dbSetupTables import create_tables

# Cria as tabelas no banco de dados
create_tables()
# Configurações de template
compiler = Compiler()

def render_template(template_name, data):
    template_path = os.path.join('templates', template_name)
    with open(template_path, 'r') as file:
        source = file.read()
    template = compiler.compile(source)
    output = template(data)
    return output.encode('utf-8')

def datetime_converter(o):
    if isinstance(o, datetime.datetime):
        return o.isoformat()  # Converte datetime para string no formato ISO 8601

class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    
    def do_GET(self):
        route = self.path
        if route.startswith('/user/'):
            user_id = route[6:]  # Assume que o ID está após '/users/'
            if user_id.isdigit():  # Verifica se o ID é numérico
                self.handle_user_id(int(user_id))
            else:
                self.handle_404()
        elif route == '/users':
            self.handle_users()
        elif route == '/about':
            self.handle_about()
        elif route == '/posts':
            self.handle_posts()
        else:
            self.handle_404()
        
    def handle_users(self):
        try:
            user_data = select_all_users()
            json_output = json.dumps(user_data, default=datetime_converter)  # Usa a função de conversão personalizada para datetime
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json_output.encode('utf-8'))
        except Exception as e:
            self.send_error(500, f"Server error: {str(e)}")
    
    def handle_user_id(self, user_id):
        try:
            user_data = select_user(user_id)
            json_output = json.dumps(user_data, default=datetime_converter)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json_output.encode('utf-8'))
        except Exception as e:
            self.send_error(500, f"Server error: {str(e)}")
    
    def handle_about(self):
        data = {}
        output = render_template('about.hbs', data)
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(output)
    
    def handle_posts(self):
        import requests
        response = requests.get('https://jsonplaceholder.typicode.com/posts')
        data = response.json()
        output = render_template('posts.hbs', {'posts': data})  # Ensure data is passed as expected by the template
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(output)
    
    def handle_404(self):
        self.send_response(404)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write("Rota nao encontrada.".encode('utf-8'))

# Configura e inicia o servidor
httpd = HTTPServer(('localhost', 8000), SimpleHTTPRequestHandler)
print("Serving at port 8000")
httpd.serve_forever()
