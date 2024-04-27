from http.server import BaseHTTPRequestHandler
import json
from db.dbOperations import insert_user

class PostRoutes(BaseHTTPRequestHandler):

    def do_POST(self):
        routes = {
            '/register': self.handle_register
        }

        if self.path in routes:
            routes[self.path]()
        else:
            self.handle_404()

    def handle_register(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        post_data = post_data.decode('utf-8')
        post_data = post_data.split('&')
        user_data = {}
        for data in post_data:
            key, value = data.split('=')
            user_data[key] = value

        try:
            # Insere o usuário no banco de dados
            insert_user(user_data['name'], user_data['password'])
            self.send_response(200)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'User registered successfully!')
        except Exception as e:
            self.send_error_response(500, f"Server error: {str(e)}")

    def handle_404(self):
        self.send_error_response(404, "Rota nao encontrada.")

    def send_error_response(self, code, message):
        self.send_error(code, message)
