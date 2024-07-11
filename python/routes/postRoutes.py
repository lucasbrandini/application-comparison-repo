from http.server import BaseHTTPRequestHandler
import http.cookies
import os
import json
import bcrypt
import base64
import cgi
import jwt
from db.dbOperations import insert_user, select_user_by_name, insert_post, insert_post_image, insert_post_video

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
            # verifica se o usuário já foi inserido no banco de dados
            try:
                user = select_user_by_name(user_data['name'])
                if user:
                    self.send_response(302)
                    self.send_header('Location', '/register')
                    self.end_headers()
                    return
            except Exception as e:
                self.send_error_response(500, f"Server error: {str(e)}")

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
            if 'Cookie' in self.headers:
                cookies = http.cookies.SimpleCookie(self.headers['Cookie'])
                if 'jwt_token' in cookies:
                    token = cookies['jwt_token'].value
                    try:
                        decoded_token = jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=['HS256'])
                        if decoded_token.get('name_user'):
                            content_type = self.headers.get('Content-Type')
                            content_length = int(self.headers['Content-Length'])

                            if 'multipart/form-data' in content_type:
                                fields = cgi.FieldStorage(fp=self.rfile, headers=self.headers, environ={'REQUEST_METHOD': 'POST', 'CONTENT_TYPE': content_type})
                                post_content = {}
                                
                                
                                for key in fields:
                                    post_content[key] = fields[key].value

                                # Verifique se o campo 'file' está presente diretamente no dicionário de fields
                                if 'file' in fields:
                                    file_field = fields['file']

                                    # Verifique se file_field é uma instância de FieldStorage e se possui atributos necessários
                                    if isinstance(file_field, cgi.FieldStorage) and hasattr(file_field, 'file') and hasattr(file_field, 'filename') and hasattr(file_field, 'type'):
                                        try:
                                            file_data = file_field.file.read()
                                            file_name = file_field.filename
                                            file_size = len(file_data)
                                            file_type = file_field.type
                                        except Exception as e:
                                            self.send_error_response(500, f"Server Error ao ler file_field: {e}")
                                            return

                                        # Limites de tamanho
                                        image_types = ['image/gif', 'image/jpeg', 'image/png']
                                        video_types = ['video/mp4']
                                        max_image_size = 20 * 1024 * 1024  # 20 MB
                                        max_video_size = 50 * 1024 * 1024  # 50 MB

                                        if file_type in image_types and file_size <= max_image_size:
                                            file_base64 = base64.b64encode(file_data).decode('utf-8')
                                            is_image = True
                                        elif file_type in video_types and file_size <= max_video_size:
                                            file_base64 = base64.b64encode(file_data).decode('utf-8')
                                            is_image = False
                                        elif file_size == 0:
                                            file_base64 = None
                                            is_image = True
                                        else:
                                            self.send_error_response(400, "Invalid file type or size")
                                            return

                                        user_name = decoded_token.get('name_user')
                                        user = select_user_by_name(user_name)
                                        
                                        print(user, "user")

                                        if user:
                                            if is_image:
                                                print(post_content.get('content', ''), "meu pau")
                                                
                                                insert_post_image(user['id_user'], post_content.get('content', ''), file_base64)
                                            else:
                                                insert_post_video(user['id_user'], post_content.get('content', ''), file_base64)

                                            self.send_response(302)
                                            self.send_header('Location', '/home')
                                            self.end_headers()
                                        else:
                                            self.send_error_response(404, "User not found")
                                    else:
                                        self.send_error_response(400, "File field is empty or invalid")
                                else:
                                    user_name = decoded_token.get('name_user')
                                    user = select_user_by_name(user_name)
                                    if user:
                                        insert_post(user['id_user'], post_content.get('content', ''))
                                        self.send_response(302)
                                        self.send_header('Location', '/home')
                                        self.end_headers()
                                    else:
                                        self.send_error_response(404, "User not found")
                            else:
                                self.send_error_response(400, "Invalid content type")
                        else:
                            self.send_error_response(401, "Unauthorized: Invalid token")
                    except jwt.ExpiredSignatureError:
                        self.send_error_response(401, "Unauthorized: Token expired")
                    except jwt.InvalidTokenError:
                        self.send_error_response(401, "Unauthorized: Invalid token")
                else:
                    self.send_error_response(401, "Unauthorized: Missing token")
            else:
                self.send_error_response(401, "Unauthorized: No cookies")
        except Exception as e:
            print(f"Exception: {e}")
            self.send_error_response(500, f"Server Error: {e}")
