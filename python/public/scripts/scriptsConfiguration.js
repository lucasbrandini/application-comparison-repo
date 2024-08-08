document.getElementById('change-username-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;

    fetch('/change-username', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/home';
        } else {
            alert('Erro: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
});