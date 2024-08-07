import io
import sys

from http.server import BaseHTTPRequestHandler
from db.dbOperations import select_all_posts_ordered, find_vote, select_user_by_name, get_post
import json
import datetime
from pybars import Compiler
import os
import requests
from middleware.jwt import verify_jwt
from urllib.parse import urlparse, parse_qs

def datetime_converter(o):
    if isinstance(o, datetime.datetime):
        return o.isoformat()

class routesGet(BaseHTTPRequestHandler):
    
    def do_GET(self):
        # Rotas estáticas
        routes = {
            '/login': self.render_login,
            '/register': self.render_register,
            '/home': self.render_home,
            '/404': self.render_404,
            '/commits': self.render_commits,
            '/create-post': self.render_create_post,
            '/configuration': self.render_configuration
        }
        
        # Verificação de rotas dinâmicas
        if self.path in routes:
            routes[self.path]()
        elif self.path.startswith('/public/'):
            self.serve_static_file(self.path)
        elif self.path.startswith('/edit-post'):
            self.render_edit_post()
        else:
            self.render_404()

    def serve_static_file(self, path):
        try:
            with open(path[1:], 'rb') as file:  # remove the leading '/'
                content = file.read()
            self.send_response(200)
            if path.endswith('.css'):
                self.send_header('Content-type', 'text/css; charset=utf-8')
            elif path.endswith('.js'):
                self.send_header('Content-type', 'application/javascript; charset=utf-8')
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
            
            id_user = self.decoded_token.get('name_user')
            user = select_user_by_name(id_user)
            
            login_user = user['name_user']
            user_vote = user['id_user']
            finds = find_vote(user_vote)
            
            # Crie um dicionário para mapear os votos do usuário pelos id_posts
            votes_map = {find['id_posts']: find['user_vote'] for find in finds}
            
            is_owner = False
            
            for post in posts:
                post_id = post['id_posts']
                post['user_vote'] = votes_map.get(post_id, 'no vote')
                
                if 'post_image' in post and post['post_image'] is not None:
                    post['post_image'] = post['post_image'].decode('utf-8') if isinstance(post['post_image'], bytes) else post['post_image']
                
                if 'post_video' in post and post['post_video'] is not None:
                    post['post_video'] = post['post_video'].decode('utf-8') if isinstance(post['post_video'], bytes) else post['post_video']
                
                if 'avatar_image' in post and post['avatar_image'] is not None:
                    post['avatar_image'] = post['avatar_image'].decode('utf-8') if isinstance(post['avatar_image'], bytes) else post['avatar_image']
            
                post['is_owner'] = post['p_id_user'] == user['id_user']  
            
            compiler = Compiler()
            
            # Use gerenciadores de contexto para abrir e ler os arquivos
            with open(os.path.join('templates', 'home.hbs'), 'r', encoding='utf-8') as file:
                source = file.read()
            template = compiler.compile(source)
            
            with open(os.path.join('templates', 'head.hbs'), 'r', encoding='utf-8') as file:
                head_source = file.read()
            head_template = compiler.compile(head_source)
            
            with open(os.path.join('templates', 'header.hbs'), 'r', encoding='utf-8') as file:
                header_source = file.read()
            header_template = compiler.compile(header_source)
            
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            
            # 
            
            
            context = {
                'posts': posts,
                'user': user,
                'header': header_template,
                'head': head_template,
                'name_user': login_user  # Adiciona o nome do usuário ao contexto
            }
            
            self.wfile.write(template(context).encode('utf-8'))
        except Exception as e:
            self.send_error_response(500, "Server Error: " + str(e))


    def render_404(self):
        self.send_error_response(404, "Rota não encontrada.")

    def send_error_response(self, code, message):
        self.send_error(code, message)

    def render_login(self):
        compiler = Compiler()
        with open(os.path.join('templates', 'login.hbs'), 'r', encoding='utf-8') as file:
            source = file.read()
        template = compiler.compile(source)
        with open(os.path.join('templates', 'head.hbs'), 'r', encoding='utf-8') as file:
            head_source = file.read()
        head_template = compiler.compile(head_source)
        self.send_response(200)
        self.send_header('Content-type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(template({'head': head_template}).encode('utf-8'))

    def render_register(self):
        compiler = Compiler()
        with open(os.path.join('templates', 'register.hbs'), 'r', encoding='utf-8') as file:
            source = file.read()
        template = compiler.compile(source)
        with open(os.path.join('templates', 'head.hbs'), 'r', encoding='utf-8') as file:
            head_source = file.read()
        head_template = compiler.compile(head_source)
        self.send_response(200)
        self.send_header('Content-type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(template({'head': head_template}).encode('utf-8'))

    @verify_jwt
    def render_create_post(self):
        try:
            compiler = Compiler()
            create_post_template_path = os.path.join('templates', 'create-post.hbs')
            if not os.path.exists(create_post_template_path):
                self.send_error_response(404, "Template file not found")
                return
            with open(create_post_template_path, 'r', encoding='utf-8') as file:
                source = file.read()
            template = compiler.compile(source)
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(template({}).encode('utf-8'))
        except Exception as e:
            print(e)
            self.send_error_response(500, "Server Error: " + str(e))
            
    @verify_jwt
    def render_configuration(self):
        try: 
            compiler = Compiler()
            with open(os.path.join('templates', 'configuration.hbs'), 'r', encoding='utf-8') as file:
                source = file.read()
            template = compiler.compile(source)
            with open(os.path.join('templates', 'head.hbs'), 'r', encoding='utf-8') as file:
                head_source = file.read()
            head_template = compiler.compile(head_source)
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(template({'head': head_template}).encode('utf-8'))
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
            with open(os.path.join('templates', 'commits.hbs'), 'r', encoding='utf-8') as file:
                source = file.read()
            template = compiler.compile(source)
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(template({'commits': commits}).encode('utf-8'))
        except Exception as e:
            print(e)
            self.send_error_response(500, "Server Error: " + str(e))
            
     # ROTA PARA RENDERIZAR A PÁGINA DE EDIÇÃO DE POSTS MAIS O POST QUE FOI SELECIONADO
    @verify_jwt
    def render_edit_post(self):
        try:
            # Parse the URL to get the query parameters
            url = urlparse(self.path)
            query_params = parse_qs(url.query)
            post_id = int(query_params.get('post_id', [None])[0])
            
            if post_id is None:
                self.send_error_response(400, "ID do post não fornecido")
                return
            
            # Pega o post pelo id
            post = get_post(post_id)
            
            print(post)
            
            # Verifica se o post existe
            if post is None:
                self.send_error_response(404, "Post não encontrado")
                return
            
            # Pega o usuário logado
            id_user = self.decoded_token.get('name_user')
            user = select_user_by_name(id_user)
            
            # Verifica se o usuário é o dono do post
            if post['p_id_user'] != user['id_user']:
                self.send_error_response(403, "Você não tem permissão para editar este post")
                return
            
            # Verifica se o usuário é o dono do post
            is_owner = post['p_id_user'] == user['id_user']

            # Compila o template
            compiler = Compiler()
            with open(os.path.join('templates', 'edit.hbs'), 'r', encoding='utf-8') as file:
                source = file.read()
            template = compiler.compile(source)
            with open(os.path.join('templates', 'head.hbs'), 'r', encoding='utf-8') as file:
                head_source = file.read()
            head_template = compiler.compile(head_source)

            # Passa o contexto para o template
            context = {
                'post': post,
                'head': head_template,
                'is_owner': is_owner
            }

            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(template(context).encode('utf-8'))

        except Exception as e:
            print(e)
            self.send_error_response(500, "Server Error: " + str(e))