import logging
import os
import base64
import cgi
import http.cookies
import jwt
import json
import bcrypt
from http.server import BaseHTTPRequestHandler
from db.dbOperations import select_user_by_name, change_username
from middleware.jwt import verify_jwt

# Configuração do logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class routesPut(BaseHTTPRequestHandler):

    def do_PUT(self):
        routes = {
            '/change-username': self.handle_change_username
        }

        if self.path in routes:
            routes[self.path]()
        else:
            self.handle_404()

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

    @verify_jwt
    def handle_change_username(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode('utf-8')

            user_data = json.loads(post_data)
            new_name = user_data.get('username')

            user_name = self.decoded_token.get('name_user')
            user = select_user_by_name(user_name)

            if user:
                user_id = user['id_user']
                message = change_username(user_id, new_name)
                if message == "Username updated successfully.":
                    # Regenerar o token JWT com o novo nome de usuário
                    token = jwt.encode({'name_user': new_name}, os.getenv('JWT_SECRET'), algorithm='HS256')
                    
                    # Enviar o novo token JWT no cookie de resposta
                    cookie = http.cookies.SimpleCookie()
                    cookie['jwt_token'] = token
                    cookie['jwt_token']['path'] = '/'
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Set-Cookie', cookie.output(header=''))
                    self.end_headers()
                    self.wfile.write(json.dumps({'success': True, 'message': message}).encode('utf-8'))
                else:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'success': False, 'message': message}).encode('utf-8'))
            else:
                self.send_error_response(404, "User not found")
        except Exception as e:
            logger.error(f"Exception during change username: {e}")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': False, 'message': str(e)}).encode('utf-8'))
