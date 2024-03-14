from flask import Flask

app = Flask(__name__)

@app.route('/main', methods=['GET'])
def main():
    return 'Welcome to the Flask App!'

if __name__ == '__main__':
    app.run(port=5000)