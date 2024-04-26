from http.server import BaseHTTPRequestHandler
from db.dbOperations import select_user, select_all_users
import json
import datetime

def datetime_converter(o):
    if isinstance(o, datetime.datetime):
        return o.isoformat()

class GetRoutes(BaseHTTPRequestHandler):

    def do_GET(self):
        routes = {
            '/users': self.handle_users,
            '/about': self.handle_about
        }

        if self.path.startswith('/user/'):
            user_id = self.path[6:]
            if user_id.isdigit():
                self.handle_user_id(int(user_id))
            else:
                self.handle_404()
        elif self.path in routes:
            routes[self.path]()
        else:
            self.handle_404()

    def handle_users(self):
        try:
            user_data = select_all_users()
            self.send_json_response(user_data)
        except Exception as e:
            self.send_error_response(500, f"Server error: {str(e)}")

    def handle_user_id(self, user_id):
        try:
            user_data = select_user(user_id)
            self.send_json_response(user_data)
        except Exception as e:
            self.send_error_response(500, f"Server error: {str(e)}")

    def handle_about(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write("About page".encode('utf-8'))

    def handle_404(self):
        self.send_error_response(404, "Rota nao encontrada.")

    def send_json_response(self, data):
        json_output = json.dumps(data, default=datetime_converter)
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json_output.encode('utf-8'))

    def send_error_response(self, code, message):
        self.send_error(code, message)
