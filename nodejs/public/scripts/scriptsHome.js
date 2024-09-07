document.getElementById('postForm').addEventListener('submit', function(event) {
    var title = document.getElementById('title').value.trim();
    var content = document.getElementById('content').value.trim();
    var file = document.getElementById('file').files.length > 0;

    if (!content && !file && !title) {
        event.preventDefault();
        alert('A postagem deve conter um título, conteúdo ou arquivo.');
    }
});

const modal = document.getElementById("myModal");

const btn = document.getElementById("openModal");

const span = document.getElementById("close");

const path = document.getElementById("closeIcon")

btn.onclick = function() {
    modal.style.display = "block";
}

span.addEventListener('mouseover', () => {
    path.style.stroke = "white";
    console.log('Overzou');
}) 

span.addEventListener('mouseout', () => {
    path.style.stroke = "#6272D6";
    console.log('Overzou pra fora');
}) 

document.addEventListener('DOMContentLoaded', function() {
    
    const openButton = document.getElementById('openModal');
  
    openButton.onclick = function() {
      modal.classList.remove('hide');
      modal.classList.add('show');
    }
    
    modal.onclick = function(event) {
        console.log(span, modal) ;
      if (event.target == modal) {
        modal.classList.remove('show');
        modal.classList.add('hide');
        console.log('fechou1');
      }
    }

    span.onclick = function(event) {
        event.stopPropagation();
        modal.classList.remove('show');
        modal.classList.add('hide');
    }

    document.getElementById("logout").addEventListener("click", function () {
        fetch('/logout', { method: 'POST' }) // Envia uma requisição para o servidor para realizar o logout
            .then(() => {
                window.location.href = "login"; // Substitua 'login' pelo caminho correto
            })
            .catch(err => console.error("Erro ao realizar logout:", err));
    });
    
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    document.querySelectorAll('.deletePost').forEach(button => {
        button.addEventListener('click', async () => {
            const postId = button.getAttribute('data-post-id');
            const response = await fetch('/delete-post', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${getCookie('token')}`
                },
                body: `post_id=${postId}`
            });
    
            if (response.ok) {
                alert('Post deleted successfully');
                location.reload();
            } else {
                const result = await response.json();
                alert(`Error: ${result.error}`);
            }
        });
    });
    
    // preciso para editar o post
    document.querySelectorAll('.editPost').forEach(button => {
        button.addEventListener('click', async () => {
            const postId = button.getAttribute('data-post-id');
            window.location.href = `/edit-post?post_id=${postId}`; //
        });
    });

    document.querySelectorAll('.commentPost').forEach(button => {
        button.addEventListener('click', async () => {
            const postId = button.getAttribute('data-post-id');
            window.location.href = `/comments?post_id=${postId}`; //
        });
    });
});
  

const voteReceive = document.querySelectorAll('.voteText');

const upvoteVote = document.querySelectorAll('.upvotePath');
  
const downvoteVote = document.querySelectorAll('.downvotePath');
  
upvoteVote.forEach(function (userVoteElement, index) {
    const vote = voteReceive[index].innerText;   
    
    if (vote == 'upvote') {
        userVoteElement.style.fill = '#d1d8ff';
    } else {
        userVoteElement.style.fill = '';
    }
});
  
downvoteVote.forEach(function (userVoteElement, index) {
    const vote = voteReceive[index].innerText;
    
    if (vote == 'downvote') {
        userVoteElement.style.fill = '#d1d8ff';
    } else {
        userVoteElement.style.fill = '';
    }
});

document.querySelectorAll('.upvote').forEach(button => {
    button.addEventListener('click', function() {
        const postId = this.getAttribute('data-post-id');
        fetch('/upvote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token') // Assuming you store JWT token in localStorage
            },
            body: JSON.stringify({ post_id: postId })
        }).then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Upvoted successfully');
                window.location.href = '/home'; // Redirect to home after upvote
            } else {
                console.error('Failed to upvote:', data.message);
            }
        }).catch(error => {
            console.error('Error during upvote:', error);
        });
    });
});

document.querySelectorAll('.downvote').forEach(button => {
    button.addEventListener('click', function() {
        const postId = this.getAttribute('data-post-id');
        fetch('/downvote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token') // Assuming you store JWT token in localStorage
            },
            body: JSON.stringify({ post_id: postId })
        }).then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Downvoted successfully');
                window.location.href = '/home'; // Redirect to home after downvote
            } else {
                console.error('Failed to downvote:', data.message);
            }
        }).catch(error => {
            console.error('Error during downvote:', error);
        });
    });
});

function toggleDropdown() {
    const dropdown = document.getElementById("myDropdown");
    const icon = document.getElementById("toggleIcon");
  
    dropdown.classList.toggle("show");
  
    if (dropdown.classList.contains("show")) {
      icon.classList.add("rotate"); // Adiciona a rotação
    } else {
      icon.classList.remove("rotate"); // Remove a rotação
    }
  }

window.onclick = function (event) {
  if (!event.target.matches(".dropbtn") && !event.target.closest(".dropdown")) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    const icon = document.getElementById("toggleIcon");
    for (var i = 0; i < dropdowns.length; i++) {
      const openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
        icon.src = "/public/assets/setaright.svg"; // Ícone para a direita
      }
    }
  }
};