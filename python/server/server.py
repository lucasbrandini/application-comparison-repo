import requests

data = {'name': 'exemplo', 'content': 'Este é um exemplo de conteúdo.'}
response = requests.post('http://localhost:5000/main', json=data)

print("Status code:", response.status_code)
print("Response text:", response.text)

try:
    print(response.json())
except ValueError:
    print("Response could not be parsed as JSON.")