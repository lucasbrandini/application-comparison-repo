import logging
import os
import base64
import cgi
import http.cookies
import jwt
import json
import bcrypt
from http.server import BaseHTTPRequestHandler
from db.dbOperations import insert_user, select_user_by_name, insert_post, insert_post_image, insert_post_video, upvote, downvote
from middleware.jwt import verify_jwt

# Configuração do logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

saltRounds = 10

class routesPost(BaseHTTPRequestHandler):

    def do_POST(self):
        routes = {
            '/register': self.handle_register,
            '/login': self.handle_login,
            '/create-post': self.handle_create_post,
            '/upvote': self.handle_upvote,
            '/downvote': self.handle_downvote
        }

        if self.path in routes:
            routes[self.path]()
        else:
            self.handle_404()

    def handle_login(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length).decode('utf-8')
        user_data = dict(data.split('=') for data in post_data.split('&'))

        try:
            user = select_user_by_name(user_data['name'])
            if user and bcrypt.checkpw(user_data['password'].encode('utf-8'), user['password'].encode('utf-8')):
                token = jwt.encode({'name_user': user['name_user']}, os.getenv('JWT_SECRET'), algorithm='HS256')
                self.send_cookie_response(token)
            else:
                self.send_error_response(401, "Unauthorized: Incorrect username or password")
        except Exception as e:
            logger.error(f"Error during login: {str(e)}")
            self.send_error_response(500, f"Server error: {str(e)}")

    def send_cookie_response(self, token):
        cookie = http.cookies.SimpleCookie()
        cookie['jwt_token'] = token
        cookie['jwt_token']['path'] = '/'
        self.send_response(302)
        self.send_header('Location', '/home')
        self.send_header('Set-Cookie', cookie.output(header=''))
        self.end_headers()

    def handle_register(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length).decode('utf-8')
        user_data = dict(data.split('=') for data in post_data.split('&'))

        try:
            user = select_user_by_name(user_data['name'])
            if user:
                self.send_response(302)
                self.send_header('Location', '/register')
                self.end_headers()
                return

            hashed_password = bcrypt.hashpw(user_data['password'].encode('utf-8'), bcrypt.gensalt(saltRounds)).decode('utf-8')
            insert_user(user_data['name'], hashed_password)

            self.send_response(302)
            self.send_header('Location', '/login')
            self.end_headers()
        except Exception as e:
            logger.error(f"Error during registration: {str(e)}")
            self.send_error_response(500, f"Server error: {str(e)}")

    def handle_404(self):
        self.send_error_response(404, "Rota nao encontrada.")

    def send_error_response(self, code, message):
        self.send_error(code, message)

    @verify_jwt
    def handle_create_post(self):
        try:
            content_type = self.headers.get('Content-Type')
            content_length = int(self.headers['Content-Length'])

            if 'multipart/form-data' in content_type:
                fields = cgi.FieldStorage(fp=self.rfile, headers=self.headers, environ={'REQUEST_METHOD': 'POST', 'CONTENT_TYPE': content_type})
                post_content = {key: fields[key].value for key in fields if fields[key].value}

                post_title = post_content.get('title')  # Adicionando o título do post

                if 'file' in fields:
                    file_field = fields['file']
                    if self.is_valid_file_field(file_field):
                        file_data, file_name, file_size, file_type = self.read_file_field(file_field)
                        is_image, file_base64 = self.handle_file_upload(file_data, file_size, file_type)

                        user_name = self.decoded_token.get('name_user')
                        user = select_user_by_name(user_name)
                        if user:
                            if is_image:
                                insert_post_image(user['id_user'], post_title, post_content.get('content', ''), file_base64)
                            else:
                                insert_post_video(user['id_user'], post_title, post_content.get('content', ''), file_base64)

                            self.redirect_to('/home')
                        else:
                            self.send_error_response(404, "User not found")
                    else:
                        self.send_error_response(400, "File field is empty or invalid")
                else:
                    user_name = self.decoded_token.get('name_user')
                    user = select_user_by_name(user_name)
                    if user:
                        insert_post(user['id_user'], post_title, post_content.get('content', ''))
                        self.redirect_to('/home')
                    else:
                        self.send_error_response(404, "User not found")
            else:
                self.send_error_response(400, "Invalid content type")
        except Exception as e:
            logger.error(f"Exception during post creation: {e}")
            self.send_error_response(500, f"Server Error: {e}")

    
    def is_valid_file_field(self, file_field):
        return isinstance(file_field, cgi.FieldStorage) and hasattr(file_field, 'file') and hasattr(file_field, 'filename') and hasattr(file_field, 'type')

    def read_file_field(self, file_field):
        try:
            file_data = file_field.file.read()
            file_name = file_field.filename
            file_size = len(file_data)
            file_type = file_field.type
            return file_data, file_name, file_size, file_type
        except Exception as e:
            logger.error(f"Error reading file field: {e}")
            raise

    def handle_file_upload(self, file_data, file_size, file_type):
        image_types = ['image/gif', 'image/jpeg', 'image/png']
        video_types = ['video/mp4']
        max_image_size = 20 * 1024 * 1024  # 20 MB
        max_video_size = 50 * 1024 * 1024  # 50 MB

        if file_type in image_types and file_size <= max_image_size:
            return True, base64.b64encode(file_data).decode('utf-8')
        elif file_type in video_types and file_size <= max_video_size:
            return False, base64.b64encode(file_data).decode('utf-8')
        elif file_size == 0:
            return True, None
        else:
            raise ValueError("Invalid file type or size")

    def redirect_to(self, location):
        self.send_response(302)
        self.send_header('Location', location)
        self.end_headers()
        
    @verify_jwt
    def handle_upvote(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = json.loads(self.rfile.read(content_length).decode('utf-8'))
            post_id = post_data.get('post_id')

            user_name = self.decoded_token.get('name_user')
            user = select_user_by_name(user_name)
            if user:
                user_id = user['id_user']
                message = upvote(post_id, user_id)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True, 'message': message}).encode('utf-8'))
            else:
                self.send_error_response(404, "User not found")
        except Exception as e:
            logger.error(f"Exception during upvote: {e}")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': False, 'message': str(e)}).encode('utf-8'))

    @verify_jwt
    def handle_downvote(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = json.loads(self.rfile.read(content_length).decode('utf-8'))
            post_id = post_data.get('post_id')

            user_name = self.decoded_token.get('name_user')
            user = select_user_by_name(user_name)
            if user:
                user_id = user['id_user']
                message = downvote(post_id, user_id)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True, 'message': message}).encode('utf-8'))
            else:
                self.send_error_response(404, "User not found")
        except Exception as e:
            logger.error(f"Exception during downvote: {e}")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': False, 'message': str(e)}).encode('utf-8'))
