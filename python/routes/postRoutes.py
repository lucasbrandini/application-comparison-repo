import http.cookies
import os
from http.server import BaseHTTPRequestHandler
import json
import bcrypt
import jwt
from db.dbOperations import insert_user, select_user_by_name

# Defina o número de salt rounds
saltRounds = 10

class PostRoutes(BaseHTTPRequestHandler):

    def do_POST(self):
        routes = {
            '/register': self.handle_register,
            '/login': self.handle_login
        }

        if self.path in routes:
            routes[self.path]()
        else:
            self.handle_404()
            
    def handle_login(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        post_data = post_data.decode('utf-8')
        post_data = post_data.split('&')
        user_data = {}
        for data in post_data:
            key, value = data.split('=')
            user_data[key] = value

        try:
            # Verifica se o usuário está no banco de dados
            user = select_user_by_name(user_data['name'])
            # Verificar se a senha fornecida corresponde à senha hash no banco de dados
            if user and bcrypt.checkpw(user_data['password'].encode('utf-8'), user['password'].encode('utf-8')):
                # Gera o token JWT
                token = jwt.encode({'name_user': user['name_user']}, os.getenv('JWT_SECRET'), algorithm='HS256')
                # Define um cookie com o token JWT
                print(token)
                self.send_cookie_response(token)
            else:
                self.send_error_response(401, "Unauthorized: Incorrect username or password")
        except Exception as e:
            self.send_error_response(500, f"Server error: {str(e)}")
    
    def send_cookie_response(self, token):
        # Cria um objeto de cookie
        cookie = http.cookies.SimpleCookie()
        # Define o valor do cookie como o token JWT
        cookie['jwt_token'] = token
        # Define a configuração do cookie (por exemplo, caminho, domínio, etc.)
        cookie['jwt_token']['path'] = '/'
        # Redireciona para a página home com o token JWT incluído
        self.send_response(302)
        self.send_header('Location', '/home')
        self.send_header('Set-Cookie', cookie.output(header=''))
        self.end_headers()

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
            # A senha é criptografada antes de ser inserida
            hashed_password = bcrypt.hashpw(user_data['password'].encode('utf-8'), bcrypt.gensalt(saltRounds)).decode('utf-8')
            insert_user(user_data['name'], hashed_password)
            self.send_response(302)
            self.send_header('Location', '/login')
            self.end_headers()
        except Exception as e:
            self.send_error_response(500, f"Server error: {str(e)}")

    def handle_404(self):
        self.send_error_response(404, "Rota nao encontrada.")

    def send_error_response(self, code, message):
        self.send_error(code, message)
