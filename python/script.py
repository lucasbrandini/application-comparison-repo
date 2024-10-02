from http.server import HTTPServer, BaseHTTPRequestHandler

import requests
from routes.routesGet import routesGet
from routes.routesPost import routesPost
from routes.routesDelete import routesDelete
from routes.routesPut import routesPut
from db.dbSetupTables import create_tables
import psutil
import os
import json
import time

# Cria as tabelas
create_tables()

# Obtém o processo atual da aplicação
process = psutil.Process(os.getpid())

# Função para obter tempo de atividade do processo (uptime)
def get_process_uptime():
    return time.time() - process.create_time()

# Função para converter bytes em KB, MB ou GB
def convert_bytes(size_in_bytes):
    if size_in_bytes < 1024:
        return f"{size_in_bytes} B"
    elif size_in_bytes < 1024 ** 2:
        return f"{size_in_bytes / 1024:.2f} KB"
    elif size_in_bytes < 1024 ** 3:
        return f"{size_in_bytes / (1024 ** 2):.2f} MB"
    else:
        return f"{size_in_bytes / (1024 ** 3):.2f} GB"

# Cria uma nova classe que herda de PostRoutes e GetRoutes
class CombinedRoutes(routesPost, routesGet, routesDelete, routesPut):
    def do_GET(self):
        if self.path == '/memory':
            # Estatísticas de uso de CPU e memória do processo da aplicação
            cpu_percent = process.cpu_percent(interval=1)  # Percentual de uso da CPU pela aplicação
            memory_info = process.memory_info()  # Uso de memória da aplicação
            
            # Número de threads ativos no processo
            thread_count = process.num_threads()

            # Tempo de atividade da aplicação (em segundos)
            uptime = get_process_uptime()

            # Formata os dados em JSON
            app_stats = {
                'cpu': {
                    'percent': f"{cpu_percent:.2f}%"  # Percentual de uso de CPU com símbolo de porcentagem
                },
                'memory': {
                    'rss': convert_bytes(memory_info.rss),    # Memória física usada pela aplicação em KB, MB ou GB
                    'vms': convert_bytes(memory_info.vms),    # Memória virtual usada pela aplicação
                    'percent': f"{process.memory_percent():.2f}%"  # Porcentagem de memória usada com símbolo de porcentagem
                },
                'threads': {
                    'count': thread_count  # Número de threads no processo
                },
                'uptime': f"{uptime:.2f} seconds"  # Tempo de atividade da aplicação
            }

            # Responde com as estatísticas da aplicação em formato JSON
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(app_stats).encode())
        else:
            super().do_GET()

class MemoryMonitorHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/memory':
            # Faz a requisição para a porta 8000 e obtém as estatísticas
            response = requests.get('http://localhost:8000/memory')
            self.send_response(response.status_code)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(response.content)
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Not Found')

# Configura e inicia o servidor
httpd = HTTPServer(('localhost', 8000), CombinedRoutes)
memory_monitor_server = HTTPServer(('localhost', 8001), MemoryMonitorHandler)

print("\u001b[36;1mServing at port 8000, access http://localhost:8000/register\u001b[0m")
print("\u001b[36;1mMemory monitor proxy running at http://localhost:8001/memory\u001b[0m")

try:
    from threading import Thread
    Thread(target=httpd.serve_forever).start()
    Thread(target=memory_monitor_server.serve_forever).start()
except KeyboardInterrupt:
    print("\nServer stopped by user")
    httpd.server_close()
    memory_monitor_server.server_close()
