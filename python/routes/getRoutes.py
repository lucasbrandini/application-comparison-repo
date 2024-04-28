from http.server import BaseHTTPRequestHandler
from db.dbOperations import select_user, select_all_users
import json
import datetime
from pybars import Compiler
import os

def datetime_converter(o):
    if isinstance(o, datetime.datetime):
        return o.isoformat()

class GetRoutes(BaseHTTPRequestHandler):

    def do_GET(self):
        routes = {
            '/login': self.render_login,
            '/register': self.render_register,
            '/home': self.render_home,
            '/404': self.render_404
        }
        if self.path in routes:
            routes[self.path]()
        else:
            self.render_404()

    def render_home(self):
        try: 
            user_data = select_all_users()
            self.send_json_response(user_data)
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
