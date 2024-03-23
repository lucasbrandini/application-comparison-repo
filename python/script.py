import requests
import os
from sqlalchemy import create_engine, Table, MetaData
from sqlalchemy.orm import sessionmaker
from http.server import HTTPServer, BaseHTTPRequestHandler
from pybars import Compiler

engine = create_engine('mysql+pymysql://admin:Password1!@localhost/python')
metadata = MetaData()
table = Table('table_name', metadata, autoload_with=engine)

Session = sessionmaker(bind=engine)
session = Session()

compiler = Compiler()

def render_template(template_name, data):
    template_path = os.path.join('templates', template_name)
    with open(template_path, 'r') as file:
        source = file.read()
    template = compiler.compile(source)
    output = template(data)
    return output

def handle_home():
    results = session.query(table).all()
    data = [row._asdict() for row in results]
    print(data, 'data')
    output = render_template('home.hbs', data)
    return output

def handle_data():
    results = session.query(table).all()
    data = [row._asdict() for row in results]
    output = render_template('data.hbs', data)
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
    '/home': handle_home,
    '/about': handle_about,
    '/posts': handle_posts,
    '/data': handle_data,
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