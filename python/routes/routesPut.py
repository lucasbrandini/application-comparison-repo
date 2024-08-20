import logging
import os
import base64
import cgi
import http.cookies
import jwt
import json
import bcrypt
import urllib.parse
from http.server import BaseHTTPRequestHandler
from db.dbOperations import select_user_by_name, change_username, update_post_image, update_post_video, edit_comment_by_author, update_avatar
from middleware.jwt import verify_jwt

# Configuração do logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class routesPut(BaseHTTPRequestHandler):

    def do_PUT(self):
        routes = {
            '/change-username': self.handle_change_username,
            '/editpost': self.handle_editpost,
            '/edit-comment': self.handle_edit_comment,
            '/update-avatar': self.handle_update_avatar
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

    @verify_jwt
    def handle_editpost(self):
        try:
            content_type = self.headers.get('Content-Type')
            content_length = int(self.headers['Content-Length'])

            if 'multipart/form-data' in content_type:
                fields = cgi.FieldStorage(fp=self.rfile, headers=self.headers, environ={'REQUEST_METHOD': 'POST', 'CONTENT_TYPE': content_type})
                post_content = {key: fields[key].value for key in fields if fields[key].value}

                post_id = post_content.get('post_id')
                title = post_content.get('title')
                content = post_content.get('content')

                # Atualiza o post no banco de dados

                if 'file' in fields:
                    file_field = fields['file']
                    if self.is_valid_file_field(file_field):
                        file_data, file_name, file_size, file_type = self.read_file_field(file_field)
                        is_image, file_base64 = self.handle_file_upload(file_data, file_size, file_type)

                        if is_image:
                            update_post_image(post_id, title, content, file_base64)
                        else:
                            update_post_video(post_id, title, content, file_base64)

                    else:
                        self.send_error_response(400, "File field is empty or invalid")

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True, 'message': 'Post atualizado com sucesso'}).encode('utf-8'))

            else:
                self.send_error_response(400, "Invalid content type")
        except Exception as e:
            logger.error(f"Exception during update post: {e}")
            self.send_error_response(500, f"Server Error: {e}")
            
    @verify_jwt
    def handle_edit_comment(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode('utf-8')

            comment_data = json.loads(post_data)
            
            comment = comment_data.get('comment')
            user_id = comment_data.get('user_id')
            post_id = int(comment_data.get('post_id'))
            id_comment = comment_data.get('id_comment')

            message = edit_comment_by_author(comment, user_id, post_id, id_comment)

            if message == "Comment updated successfully.":
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True, 'message': message}).encode('utf-8'))
            else:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'message': message}).encode('utf-8'))
        except Exception as e:
            logger.error(f"Exception during edit comment: {e}")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': False, 'message': str(e)}).encode('utf-8'))
    @verify_jwt
    def handle_update_avatar(self):
        try:
            content_type = self.headers.get('Content-Type')
            content_length = int(self.headers['Content-Length'])
            user_name = self.decoded_token.get('name_user')
            user = select_user_by_name(user_name)
            user_id = user['id_user']

            if 'multipart/form-data' in content_type:
                fields = cgi.FieldStorage(fp=self.rfile, headers=self.headers, environ={'REQUEST_METHOD': 'PUT', 'CONTENT_TYPE': content_type})
                if 'avatar' in fields:
                    file_field = fields['avatar']
                    if self.is_valid_file_field(file_field):
                        file_data, file_name, file_size, file_type = self.read_file_field(file_field)
                        is_image, file_base64 = self.handle_file_upload(file_data, file_size, file_type)

                        if is_image:
                            update_avatar(user_id, file_base64)
                            self.send_response(200)
                            self.send_header('Content-Type', 'application/json')
                            self.end_headers()
                            self.wfile.write(json.dumps({'success': True, 'message': 'Avatar atualizado com sucesso'}).encode('utf-8'))
                        else:
                            self.send_error_response(400, "Invalid file type. Please upload an image file.")
                    else:
                        self.send_error_response(400, "File field is empty or invalid")
                else:
                    self.send_error_response(400, "File field is empty or invalid")
            else:
                self.send_error_response(400, "Invalid content type")
        except Exception as e:
            logger.error(f"Exception during update avatar: {e}")
            self.send_error_response(500, f"Server Error: {e}")
