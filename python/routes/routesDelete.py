import logging
import os
import base64
import cgi
import http.cookies
import jwt
import json
import bcrypt
from http.server import BaseHTTPRequestHandler
from db.dbOperations import delete_post, delete_user
from middleware.jwt import verify_jwt

# Configuração do logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class routesDelete(BaseHTTPRequestHandler):

    def do_DELETE(self):
        routes = {
            '/delete-post': self.handle_delete_post
        }

        if self.path in routes:
            routes[self.path]()
        else:
            self.handle_404()

    @verify_jwt
    def handle_delete_post(self):
        try:
            # Verificar o JWT e obter o payload
            auth_header = self.headers.get('Authorization')
            if not auth_header:
                self.send_error_response(401, "Unauthorized: No token provided")
                return

            token = auth_header.split(" ")[1]
            payload = verify_jwt(token)

            # Extrair dados da requisição
            content_length = int(self.headers['Content-Length'])
            delete_data = self.rfile.read(content_length).decode('utf-8')
            delete_data = dict(data.split('=') for data in delete_data.split('&'))

            post_id = delete_data.get('post_id')
            if not post_id:
                self.send_error_response(400, "Bad Request: Post ID not provided")
                return

            # Deletar o post
            delete_post(post_id)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"message": "Post deleted successfully"}).encode('utf-8'))
        except Exception as e:
            logger.error(f"Error during post deletion: {str(e)}")
            self.send_error_response(500, f"Server error: {str(e)}")

    def handle_404(self):
        self.send_response(404)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"error": "Not Found"}).encode('utf-8'))

    def send_error_response(self, code, message):
        self.send_response(code)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"error": message}).encode('utf-8'))
