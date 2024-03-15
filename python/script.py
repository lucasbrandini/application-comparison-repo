from flask import Flask, jsonify, request, redirect, url_for, render_template

app = Flask(__name__)

data = []

@app.route('/main', methods=['GET', 'POST'])
def main():
    if request.method == 'POST':
        name = request.json.get('name')  
        content = request.json.get('content')  
        print(f'Name: {name}, Content: {content}')  
        data.append({'name': name, 'content': content})
        return redirect(url_for('show_data'))

    return jsonify(data)

@app.route('/show_data')
def show_data():
    return render_template('data.html', data=data)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
