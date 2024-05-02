import requests
from http.server import BaseHTTPRequestHandler
from db.dbOperations import select_user, select_all_users
import json
import datetime
from pybars import Compiler
import os
import jwt
import http.cookies

def datetime_converter(o):
    if isinstance(o, datetime.datetime):
        return o.isoformat()

class GetRoutes(BaseHTTPRequestHandler):

    def do_GET(self):
        routes = {
            '/login': self.render_login,
            '/register': self.render_register,
            '/home': self.render_home,
            '/404': self.render_404,
            '/commits': self.render_commits,
        }
        if self.path in routes:
            routes[self.path]()
        elif self.path.startswith('/public/'):
            self.serve_static_file(self.path)
        else:
            self.render_404()

    def serve_static_file(self, path):
        try:
            with open(path[1:], 'rb') as file:  # remove the leading '/'
                content = file.read()
            self.send_response(200)
            if path.endswith('.css'):
                self.send_header('Content-type', 'text/css')
            elif path.endswith('.js'):
                self.send_header('Content-type', 'application/javascript')
            elif path.endswith('.jpg') or path.endswith('.jpeg'):
                self.send_header('Content-type', 'image/jpeg')
            elif path.endswith('.png'):
                self.send_header('Content-type', 'image/png')
            elif path.endswith('.svg'):
                self.send_header('Content-type', 'image/svg+xml')
            # add more content types if needed
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_error_response(404, 'File not found')

    def render_home(self):
        try:
            # Verifica se o token JWT está presente nos cookies
            if 'Cookie' in self.headers:
                cookies = http.cookies.SimpleCookie(self.headers['Cookie'])
                if 'jwt_token' in cookies:
                    token = cookies['jwt_token'].value
                    try:
                        # Decodifica o token JWT
                        decoded_token = jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=['HS256'])
                        # Se o token for válido, permite o acesso à página home
                        if decoded_token.get('name_user'):
                            user_data = select_all_users()
                            self.send_response(200)
                            self.send_header('Content-type', 'application/json')
                            self.end_headers()
                            self.wfile.write(json.dumps(user_data, default=datetime_converter).encode())
                        else:
                            # Token inválido
                            self.send_error_response(401, "Unauthorized: Invalid token")
                    except jwt.ExpiredSignatureError:
                        # Token expirado
                        self.send_error_response(401, "Unauthorized: Token expired")
                    except jwt.InvalidTokenError:
                        # Token inválido
                        self.send_error_response(401, "Unauthorized: Invalid token")
                else:
                    # Nenhum token JWT presente nos cookies
                    self.send_error_response(401, "Unauthorized: Missing token")
            else:
                # Nenhum cookie presente na requisição
                self.send_error_response(401, "Unauthorized: No cookies")
        except Exception as e:
            self.send_error_response(500, "Server Error")

    def render_404(self):
        self.send_error_response(404, "Rota nao encontrada.")

    def send_error_response(self, code, message):
        self.send_error(code, message)

    def render_login(self):
        compiler = Compiler()

        with open(os.path.join('templates', 'login.hbs'), 'r') as file:
            source = file.read()
        template = compiler.compile(source)
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(template({}).encode())

    def render_register(self):
        compiler = Compiler()

        with open(os.path.join('templates', 'register.hbs'), 'r') as file:
            source = file.read()
        template = compiler.compile(source)
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(template({}).encode())

    def render_commits(self):
        try:
            # Verifica se o token JWT está presente nos cookies
            if 'Cookie' in self.headers:
                cookies = http.cookies.SimpleCookie(self.headers['Cookie'])
                if 'jwt_token' in cookies:
                    token = cookies['jwt_token'].value
                    try:
                        # Decodifica o token JWT
                        decoded_token = jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=['HS256'])
                        # Se o token for válido, permite o acesso à página de commits
                        if decoded_token.get('name_user'):
                            # Faz um fetch para a URL
                            commits = []
                            page = 1
                            while True:
                                try:
                                    response = requests.get(f'https://api.github.com/repos/lucaascriado/application-comparison-repo/commits?page={page}')
                                    # Verifica se a solicitação foi bem-sucedida
                                    if response.status_code == 200:
                                        # Parseia a resposta como JSON
                                        new_commits = response.json()
                                        if not new_commits:
                                            break
                                        commits.extend(new_commits)
                                        page += 1
                                    else:
                                        # Se a solicitação falhar, envia uma resposta de erro
                                        self.send_error_response(response.status_code, "Failed to fetch commits")
                                        return
                                except requests.exceptions.RequestException as e:
                                    self.send_error_response(500, str(e))
                                    return
                            # Compila o template Handlebars
                            compiler = Compiler()
                            with open(os.path.join('templates', 'commits.hbs'), 'r') as file:
                                source = file.read()
                            template = compiler.compile(source)
                            # Renderiza o template com os dados dos commits
                            self.send_response(200)
                            self.send_header('Content-type', 'text/html')
                            self.end_headers()
                            self.wfile.write(template({'commits': commits}).encode())
                        else:
                            # Token inválido
                            self.send_error_response(401, "Unauthorized: Invalid token")
                    except jwt.ExpiredSignatureError:
                        # Token expirado
                        self.send_error_response(401, "Unauthorized: Token expired")
                    except jwt.InvalidTokenError:
                        # Token inválido
                        self.send_error_response(401, "Unauthorized: Invalid token")
                else:
                    # Nenhum token JWT presente nos cookies
                    self.send_error_response(401, "Unauthorized: Missing token")
            else:
                # Nenhum cookie presente na requisição
                self.send_error_response(401, "Unauthorized: No cookies")
        except Exception as e:
            print(e)
            self.send_error_response(500, "Server Error: " + str(e))