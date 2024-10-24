import http.cookies
import jwt
import os
from http.server import BaseHTTPRequestHandler

class MyRequestHandler(BaseHTTPRequestHandler):
    def send_error_response(self, status_code, message):
        self.send_response(status_code)
        self.send_header('Content-Type', 'text/html')
        self.end_headers()
        self.wfile.write(f"<html><body><h1>{message}</h1></body></html>".encode('utf-8'))

    def redirect_to(self, location):
        self.send_response(302)
        self.send_header('Location', location)
        self.end_headers()

def verify_jwt(handler):
    def wrapper(self, *args, **kwargs):
        if 'Cookie' in self.headers:
            cookies = http.cookies.SimpleCookie(self.headers['Cookie'])
            if 'jwt_token' in cookies:
                token = cookies['jwt_token'].value
                try:
                    decoded_token = jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=['HS256'])
                    if decoded_token.get('name_user'):
                        self.decoded_token = decoded_token
                        return handler(self, *args, **kwargs)
                    else:
                        self.redirect_to('/login')
                except jwt.ExpiredSignatureError:
                    self.redirect_to('/login')
                except jwt.InvalidTokenError:
                    self.redirect_to('/login')
            else:
                self.redirect_to('/login')
        else:
            self.redirect_to('/login')
    return wrapper