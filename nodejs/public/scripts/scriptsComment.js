document.addEventListener('DOMContentLoaded', function() {
    const editButtons = document.querySelectorAll('.edit-comment-button');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const commentId = button.getAttribute('data-comment-id');
            const form = document.getElementById(`editCommentForm-${commentId}`);
            form.style.display = form.style.display === 'block' ? 'none' : 'block';
        });
    });

    const editForms = document.querySelectorAll('.edit-comment-form');
    editForms.forEach(form => {
        form.addEventListener('submit', function(event) {
            event.preventDefault();

            const textarea = form.querySelector('.commentArea');
            const comment = textarea.value.trim();

            if (comment === '') {
                alert('O comentário não pode estar vazio.');
                return;
            }

            const userId = form.getAttribute('data-user-id');
            const commentId = form.getAttribute('data-comment-id');            
            const postId = form.getAttribute('data-post-id');
            const formData = new FormData(form);

            const data = {
                user_id: parseInt(userId, 10),
                id_comment: parseInt(commentId, 10),
                comment: formData.get('comment'),
                post_id: parseInt(postId, 10)
            };

            fetch(`/edit-comment`, {
                method: 'PUT',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(error => { throw error });
                }
                return response.json();
            })
            .then(data => {
                const commentText = document.getElementById(`comment-text-${commentId}`);
                commentText.textContent = formData.get('comment');
                form.style.display = 'none';
            })
            .catch(error => {
                console.error('Erro:', error);
            });
        });
    });

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    const confirmDeleteButtons = document.querySelectorAll('.deleteComment');
    confirmDeleteButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const commentId = this.getAttribute('data-comment-id');

            const response = await fetch('/delete-comment', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${getCookie('token')}`
                },
                body: `comment_id=${commentId}`
            });

            if (response.ok) {
                alert('Comentário deletado com sucesso');

                const commentElement = document.getElementById(`comment-${commentId}`);
                commentElement.remove();

                const commentCountElement = document.getElementById('comment-count');
                let currentCount = parseInt(commentCountElement.textContent, 10);
                commentCountElement.textContent = currentCount > 0 ? currentCount - 1 : 0;
            } else {
                const result = await response.json();
                alert(`Erro: ${result.error}`);
            }
        });
    });

});

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
    const confirmBox = element.parentElement.querySelector('.confirmDelete');
    confirmBox.classList.add('show');
}

function cancelDelete(element) {
    const confirmBox = element.closest('.confirmDelete');
    confirmBox.classList.remove('show');
}

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
        const dropdowns = document.getElementsByClassName("dropdown-content");
        const icon = document.getElementById("toggleIcon");
        for (let i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (openDropdown.classList.contains("show")) {
                openDropdown.classList.remove("show");
                icon.classList.remove("rotate");
            }
        }
    }
};

document.getElementById("logout").addEventListener("click", function () {
    document.cookie = "jwt_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
});