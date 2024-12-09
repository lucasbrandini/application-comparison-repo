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

const cancelSpan = document.getElementById("cancel");

const submitBtn = document.getElementById('submit-btn');

const titleInput = document.getElementById('title');

const titleError = document.getElementById('title-error');

const fileInput = document.getElementById('file');

const fileName = document.getElementById('file-name');

const filePreviewDiv = document.getElementById('preview');

btn.onclick = function() {
    modal.style.display = "block";
}

span.addEventListener('mouseover', () => {
    path.style.stroke = "white";
}) 

span.addEventListener('mouseout', () => {
    path.style.stroke = "#6272D6";
}) 

document.addEventListener('DOMContentLoaded', function() {
    
    const openButton = document.getElementById('openModal');
  
    openButton.onclick = function() {
      modal.classList.remove('hide');
      modal.classList.add('show');
    }
    
    modal.onclick = function(event) {
      if (event.target == modal) {
        modal.classList.remove('show');
        modal.classList.add('hide');
      }
    }

    span.onclick = function(event) {
        event.stopPropagation();
        modal.classList.remove('show');
        modal.classList.add('hide');
    }

    cancelSpan.onclick = function(event) {
        event.stopPropagation();
        modal.classList.remove('show');
        modal.classList.add('hide');
    }

    document.getElementById("logout").addEventListener("click", function () {
        document.cookie =
          "jwt_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "login";
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

    document.querySelectorAll('.cardTextDescri').forEach(card => {
        const maxLength = 190;
        card.innerText = card.innerText.length > maxLength ? card.innerText.substring(0, maxLength) + '...' : card.innerText;
    });
});
  

document.addEventListener('DOMContentLoaded', function() {
    const voteReceive = document.querySelectorAll('.voteText');
    const upvoteVote = document.querySelectorAll('.upvotePath');
    const downvoteVote = document.querySelectorAll('.downvotePath');
    const voteStyle = document.querySelectorAll('.voteStyle');

    upvoteVote.forEach(function (userVoteElement, index) {
        if (voteReceive[index]) {
            const vote = voteReceive[index].innerText.trim();

            if (vote === 'upvote') {
                userVoteElement.style.fill = '#fff';
            } else {
                userVoteElement.style.fill = '';
            }
        }
    });

    downvoteVote.forEach(function (userVoteElement, index) {
        if (voteReceive[index]) {
            const vote = voteReceive[index].innerText.trim();

            if (vote === 'downvote') {
                userVoteElement.style.fill = '#fff';
            } else {
                userVoteElement.style.fill = '';
            }
        }
    });

    voteStyle.forEach(function (userVoteElement, index) {
        if (voteReceive[index]) {
            const vote = voteReceive[index].innerText.trim();

            if (vote === 'upvote') {
             
                userVoteElement.style.backgroundColor = '#75BA5B';
            } else if (vote === 'downvote') {
                userVoteElement.style.backgroundColor = '#BA5B5B';
            } else {
                userVoteElement.style.backgroundColor = '';
            }
        }
    });
});


document.querySelectorAll('.upvote').forEach(button => {
    button.addEventListener('click', function() {
        const postId = this.getAttribute('data-post-id');
        fetch('/upvote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({ post_id: postId })
        }).then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/home';
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
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({ post_id: postId })
        }).then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/home';
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
      icon.classList.add("rotate");
    } else {
      icon.classList.remove("rotate");
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
        icon.src = "/public/assets/setaright.svg";
      }
    }
  }
};

function toggleOptions(element) {
    var subOption = element.parentElement.querySelector('.subOption');

    if (subOption.classList.contains('show')) {
        subOption.classList.remove('show');
        document.removeEventListener('click', outsideClickListener);
        document.removeEventListener('keydown', escKeyListener);
    } else {
        closeAllMenus();

        subOption.classList.add('show');

        setTimeout(() => {
            document.addEventListener('click', outsideClickListener);
            document.addEventListener('keydown', escKeyListener);
        }, 0);
    }
}

function outsideClickListener(event) {
    var openMenus = document.querySelectorAll('.subOption.show');
    openMenus.forEach(function(menu) {
        if (!menu.contains(event.target) && !menu.previousElementSibling.contains(event.target)) {
            menu.classList.remove('show');
        }
    });

    if (openMenus.length === 0) {
        document.removeEventListener('click', outsideClickListener);
    }
}

function escKeyListener(event) {
    if (event.key === "Escape") {
        closeAllMenus();
        document.removeEventListener('keydown', escKeyListener);
    }
}

function closeAllMenus() {
    var openMenus = document.querySelectorAll('.subOption.show');
    openMenus.forEach(function(menu) {
        menu.classList.remove('show');
    });

    var confirmBoxes = document.querySelectorAll('.confirmDelete.show');
    confirmBoxes.forEach(function(box) {
        box.classList.remove('show');
    });
}

function confirmDelete(element) {
    const confirmBox = element.nextElementSibling;
    confirmBox.classList.add('show');
}

function cancelDelete(element) {
    const confirmBox = element.parentElement;
    confirmBox.classList.remove('show');
}

const clearInputButton = document.getElementById('clear-input');

fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];    
    
    

    if (file) {
        filePreviewDiv.style.display = 'flex';
        const maxLength = 28;
        let displayName = file.name;
        if (file.name.length > maxLength) {
            displayName = file.name.slice(0, maxLength) + '...';
        }

        fileName.textContent = displayName;

        filePreviewDiv.innerHTML = '';

        const fileURL = URL.createObjectURL(file);

        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = fileURL;
            filePreviewDiv.appendChild(img);
        } else if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.src = fileURL;
            video.controls = true;
            filePreviewDiv.appendChild(video);
        }
    } else {
        filePreviewDiv.style.display = 'none';
        fileName.textContent = '';
        filePreviewDiv.innerHTML = '';
    }

    if (fileInput.files.length > 0) {
        fileName.textContent = fileInput.files[0].name;
        clearInputButton.style.display = 'block';
    } else {
        clearInputButton.style.display = 'none';
    }
});

document.getElementById('clear-input').addEventListener('click', function() {
    const fileName = document.getElementById('file-name');

    fileInput.value = '';

    filePreviewDiv.style.display = 'none';
    fileName.textContent = 'Selecione uma imagem/vídeo';
    filePreviewDiv.innerHTML = '';
    this.style.display = 'none';
});

cancelSpan.addEventListener('click', function() {

    document.getElementById('postForm').reset();
    
    filePreviewDiv.style.display = 'none';

    filePreviewDiv.innerHTML = '';
    
    clearInputButton.style.display = 'none';
    
    fileName.innerText = 'Selecione uma imagem/vídeo';
    submitBtn.disabled = true;
    titleError.classList.add('hide-error'); 
});

titleInput.addEventListener('input', function() {    

    if (titleInput.value.trim() === '') {
      submitBtn.disabled = true;
      titleError.classList.remove('hide-error');
    } else {
      submitBtn.disabled = false;
      titleError.classList.add('hide-error');
    }
});