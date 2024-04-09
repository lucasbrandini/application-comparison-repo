import requests
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from pybars import Compiler
import mysql.connector

compiler = Compiler()

def render_template(template_name, data):
    template_path = os.path.join('templates', template_name)
    with open(template_path, 'r') as file:
        source = file.read()
    template = compiler.compile(source)
    output = template(data)
    return output

def handle_about():
    data = {}
    output = render_template('about.hbs', data)
    return output

def handle_posts():
    response = requests.get('https://jsonplaceholder.typicode.com/posts')
    data = response.json()
    output = render_template('posts.hbs', data)
    return output

def handle_404():
    return "Rota nao encontrada."

routes = {
    '/about': handle_about,
    '/posts': handle_posts,
}

class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        route = self.path
        handler = routes.get(route, handle_404)
        output = handler()
        if output == "Rota nao encontrada.":
            self.send_response(404)
        else:
            self.send_response(200)
        self.end_headers()
        self.wfile.write(output.encode())

httpd = HTTPServer(('localhost', 8000), SimpleHTTPRequestHandler)
httpd.serve_forever()