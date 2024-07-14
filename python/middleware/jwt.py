import os
import http.cookies
import jwt

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
                        self.send_error_response(401, "Unauthorized: Invalid token")
                except jwt.ExpiredSignatureError:
                    self.send_error_response(401, "Unauthorized: Token expired")
                except jwt.InvalidTokenError:
                    self.send_error_response(401, "Unauthorized: Invalid token")
            else:
                self.send_error_response(401, "Unauthorized: Missing token")
        else:
            self.send_error_response(401, "Unauthorized: No cookies")
    return wrapper
