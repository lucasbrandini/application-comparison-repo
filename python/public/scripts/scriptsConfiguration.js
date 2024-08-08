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
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => { throw error });
        }
        return response.json();
    })
    .then(data => {
        // Handle success response
        window.location.href = '/home';
    })
    .catch(error => {
        console.error('Error:', error);
        // Handle error response
    });
});


