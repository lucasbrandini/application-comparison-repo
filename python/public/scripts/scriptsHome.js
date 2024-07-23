document.getElementById('postForm').addEventListener('submit', function(event) {
    var content = document.getElementById('content').value.trim();
    var file = document.getElementById('file').files.length > 0;

    if (!content && !file) {
        event.preventDefault();
        alert('BOTA ALGUMA COISA AI MEU NOBRE');
    }
});

var modal = document.getElementById("myModal");

var btn = document.getElementById("openModal");

var span = document.getElementsByClassName("close")[0];

var textarea = document.getElementById("content");

var voteReceive = document.querySelectorAll('.voteText');

var upvoteVote = document.querySelectorAll('.upvotePath');

var downvoteVote = document.querySelectorAll('.downvotePath');

upvoteVote.forEach(function (userVoteElement, index) {
    var vote = voteReceive[index].innerText;   
    
    if (vote == 'upvote') {
        userVoteElement.style.fill = '#d1d8ff';
    } else {
        userVoteElement.style.fill = '';
    }
});

downvoteVote.forEach(function (userVoteElement, index) {
    var vote = voteReceive[index].innerText;
    
    if (vote == 'downvote') {
        userVoteElement.style.fill = '#d1d8ff';
    } else {
        userVoteElement.style.fill = '';
    }
});

btn.onclick = function() {
    modal.style.display = "block";
}

span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

var upvote = document.getElementById('upvote');
var downvote = document.getElementById('downvote');

document.querySelectorAll('.upvote').forEach(button => {
    button.addEventListener('click', function() {
        var postId = this.getAttribute('data-post-id');
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
        var postId = this.getAttribute('data-post-id');
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

document.addEventListener("DOMContentLoaded", (event) => {
  document.getElementById("settings").addEventListener("click", function () {
    // Redirecionar para a página de configurações
    window.location.href = "configurations.html"; // Substitua 'configurations.html' pelo caminho correto
  });

  document.getElementById("logout").addEventListener("click", function () {
    // Excluir o cookie e redirecionar para a página de login
    document.cookie =
      "jwt_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "login"; // Substitua 'login.html' pelo caminho correto
  });
});

function toggleDropdown() {
  var dropdown = document.getElementById("myDropdown");
  var icon = document.getElementById("toggleIcon");

  dropdown.classList.toggle("show");

  if (dropdown.classList.contains("show")) {
    icon.src = "/public/assets/setaup.svg"; // Ícone para cima
  } else {
    icon.src = "/public/assets/setaright.svg"; // Ícone para a direita
  }
}

function toggleDropdown() {
    var dropdown = document.getElementById("myDropdown");
    var icon = document.getElementById("toggleIcon");
  
    dropdown.classList.toggle("show");
  
    if (dropdown.classList.contains("show")) {
      icon.classList.add("rotate"); // Adiciona a rotação
    } else {
      icon.classList.remove("rotate"); // Remove a rotação
    }
  }
  

// Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
  if (!event.target.matches(".dropbtn") && !event.target.closest(".dropdown")) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var icon = document.getElementById("toggleIcon");
    for (var i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
        icon.src = "/public/assets/setaright.svg"; // Ícone para a direita
      }
    }
  }
};