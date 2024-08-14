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

document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('.list-config a');
    const sections = document.querySelectorAll('.content-item');

    // Scroll suave ao clicar nos links
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            window.scrollTo({
                top: targetElement.offsetTop,
                behavior: 'smooth'
            });
        });
    });

    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 60) {
                current = section.getAttribute('id');
            }
        });

        links.forEach(link => {
            link.parentElement.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.parentElement.classList.add('active');
            }
        });
    });
});





