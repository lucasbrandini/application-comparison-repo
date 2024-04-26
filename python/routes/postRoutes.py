from http.server import BaseHTTPRequestHandler
import json
import requests

class PostRoutes(BaseHTTPRequestHandler):

    def do_POST(self):
        routes = {
            '/posts': self.handle_posts
        }

        if self.path in routes:
            routes[self.path]()
        else:
            self.handle_404()

    def handle_posts(self):
        try:
            response = requests.get('https://jsonplaceholder.typicode.com/posts')
            data = response.json()
            self.send_json_response(data)
        except Exception as e:
            self.send_error_response(500, f"Server error: {str(e)}")

    def handle_404(self):
        self.send_error_response(404, "Rota nao encontrada.")

    def send_json_response(self, data):
        json_output = json.dumps(data)
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json_output.encode('utf-8'))

    def send_error_response(self, code, message):
        self.send_error(code, message)
