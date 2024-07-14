from http.server import BaseHTTPRequestHandler
from db.dbOperations import select_all_posts_ordered
import json
import datetime
from pybars import Compiler
import os
import requests
from middleware.jwt import verify_jwt

def datetime_converter(o):
    if isinstance(o, datetime.datetime):
        return o.isoformat()

class routesGet(BaseHTTPRequestHandler):

    def do_GET(self):
        routes = {
            '/login': self.render_login,
            '/register': self.render_register,
            '/home': self.render_home,
            '/404': self.render_404,
            '/commits': self.render_commits,
            '/create-post': self.render_create_post,
            '/render-posts': self.render_posts
        }
        if self.path in routes:
            routes[self.path]()
        elif self.path.startswith('/public/'):
            self.serve_static_file(self.path)
        else:
            self.render_404()

    def serve_static_file(self, path):
        try:
            with open(path[1:], 'rb') as file:  # remove the leading '/'
                content = file.read()
            self.send_response(200)
            if path.endswith('.css'):
                self.send_header('Content-type', 'text/css')
            elif path.endswith('.js'):
                self.send_header('Content-type', 'application/javascript')
            elif path.endswith('.jpg') or path.endswith('.jpeg'):
                self.send_header('Content-type', 'image/jpeg')
            elif path.endswith('.png'):
                self.send_header('Content-type', 'image/png')
            elif path.endswith('.svg'):
                self.send_header('Content-type', 'image/svg+xml')
            # add more content types if needed
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_error_response(404, 'File not found')

    @verify_jwt
    def render_home(self):
        try:
            posts = select_all_posts_ordered()
            compiler = Compiler()
            with open(os.path.join('templates', 'home.hbs'), 'r') as file:
                source = file.read()
            template = compiler.compile(source)
            with open(os.path.join('templates', 'head.hbs'), 'r') as file:
                head_source = file.read()
            head_template = compiler.compile(head_source)
            with open(os.path.join('templates', 'header.hbs'), 'r') as file:
                header_source = file.read()
            header_template = compiler.compile(header_source)
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            for post in posts:
                if 'post_image' in post and post['post_image'] is not None:
                    post['post_image'] = post['post_image'].decode('utf-8') if isinstance(post['post_image'], bytes) else post['post_image']
                elif 'post_video' in post and post['post_video'] is not None:
                    post['post_video'] = post['post_video'].decode('utf-8') if isinstance(post['post_video'], bytes) else post['post_video']
            self.wfile.write(template({'posts': posts, 'header': header_template, 'head': head_template}).encode())
        except Exception as e:
            self.send_error_response(500, "Server Error: " + str(e))

    def render_404(self):
        self.send_error_response(404, "Rota nao encontrada.")

    def send_error_response(self, code, message):
        self.send_error(code, message)

    def render_login(self):
        compiler = Compiler()
        with open(os.path.join('templates', 'login.hbs'), 'r') as file:
            source = file.read()
        template = compiler.compile(source)
        with open(os.path.join('templates', 'head.hbs'), 'r') as file:
            head_source = file.read()
        head_template = compiler.compile(head_source)
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(template({'head': head_template}).encode())

    def render_register(self):
        compiler = Compiler()
        with open(os.path.join('templates', 'register.hbs'), 'r') as file:
            source = file.read()
        template = compiler.compile(source)
        with open(os.path.join('templates', 'head.hbs'), 'r') as file:
            head_source = file.read()
        head_template = compiler.compile(head_source)
        self.send_response(200)
        self.send_header('Content-type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(template({'head': head_template}).encode())

    @verify_jwt
    def render_create_post(self):
        try:
            compiler = Compiler()
            create_post_template_path = os.path.join('templates', 'create-post.hbs')
            if not os.path.exists(create_post_template_path):
                self.send_error_response(404, "Template file not found")
                return
            with open(create_post_template_path, 'r') as file:
                source = file.read()
            template = compiler.compile(source)
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(template({}).encode())
        except Exception as e:
            print(e)
            self.send_error_response(500, "Server Error: " + str(e))

    @verify_jwt
    def render_commits(self):
        try:
            commits = []
            page = 1
            while True:
                try:
                    response = requests.get(f'https://api.github.com/repos/lucaascriado/application-comparison-repo/commits?page={page}')
                    if response.status_code == 200:
                        new_commits = response.json()
                        if not new_commits:
                            break
                        commits.extend(new_commits)
                        page += 1
                    else:
                        self.send_error_response(response.status_code, "Failed to fetch commits")
                        return
                except requests.exceptions.RequestException as e:
                    self.send_error_response(500, str(e))
                    return
            compiler = Compiler()
            with open(os.path.join('templates', 'commits.hbs'), 'r') as file:
                source = file.read()
            template = compiler.compile(source)
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(template({'commits': commits}).encode())
        except Exception as e:
            print(e)
            self.send_error_response(500, "Server Error: " + str(e))

    @verify_jwt
    def render_posts(self):
        try:
            posts = select_all_posts_ordered()
            compiler = Compiler()
            with open(os.path.join('templates', 'render-posts.hbs'), 'r') as file:
                source = file.read()
            template = compiler.compile(source)
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            for post in posts:
                if 'post_image' in post and post['post_image'] is not None:
                    post['post_image'] = post['post_image'].decode('utf-8') if isinstance(post['post_image'], bytes) else post['post_image']
                elif 'post_video' in post and post['post_video'] is not None:
                    post['post_video'] = post['post_video'].decode('utf-8') if isinstance(post['post_video'], bytes) else post['post_video']
            self.wfile.write(template({'posts': posts}).encode())
        except Exception as e:
            print(e)
            self.send_error_response(500, "Server Error: " + str(e))
