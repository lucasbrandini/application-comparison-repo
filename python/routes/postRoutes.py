# Importando as funções necessárias
from http.server import BaseHTTPRequestHandler
import http.cookies
import os
import json
import bcrypt
import base64
import cgi
import jwt
from db.dbOperations import insert_user, select_user_by_name, insert_post, insert_post_image

# Defina o número de salt rounds
saltRounds = 10

class PostRoutes(BaseHTTPRequestHandler):

    def do_POST(self):
        routes = {
            '/register': self.handle_register,
            '/login': self.handle_login,
            '/create-post': self.handle_create_post
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

    def handle_create_post(self):
        try:
            # Verifica se o token JWT está presente nos cookies
            if 'Cookie' in self.headers:
                cookies = http.cookies.SimpleCookie(self.headers['Cookie'])
                if 'jwt_token' in cookies:
                    token = cookies['jwt_token'].value
                    try:
                        # Decodifica o token JWT
                        decoded_token = jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=['HS256'])
                        # Se o token for válido, permite o acesso à página de criação de post
                        if decoded_token.get('name_user'):
                            content_type = self.headers.get('Content-Type')
                            content_length = int(self.headers['Content-Length'])
                            #post_data = self.rfile.read(content_length)
                            
                            if 'multipart/form-data' in content_type:
                                # Processar dados do formulário multipart
                                fields = cgi.FieldStorage(fp=self.rfile, headers=self.headers, environ={'REQUEST_METHOD': 'POST', 'CONTENT_TYPE': content_type})
                                post_content = {}
                                for key in fields:
                                    post_content[key] = fields[key].value

                                # Verifica se o campo de imagem está presente
                                if 'image' in post_content:
                                    # Converte a imagem em base64 ou blob, conforme necessário
                                    image_file = fields['image'].file.read()

                                    image_base64 = base64.b64encode(image_file)
                                else:
                                    image_file = None
                            else:
                                # Lidar com outros tipos de dados de formulário, se necessário
                                pass

                            user_name = decoded_token.get('name_user')
                            user = select_user_by_name(user_name)

                            if user:
                                if image_file:
                                    # Insira o post no banco de dados com a imagem
                                    insert_post_image(user['id_user'], post_content.get('content', ''), image_base64)
                                else:
                                    # Insira o post no banco de dados sem a imagem
                                    insert_post(user['id_user'], post_content.get('content', ''))
                                    
                                self.send_response(302)
                                self.send_header('Location', '/home')
                                self.end_headers()
                            else:
                                self.send_error_response(404, "User not found")
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