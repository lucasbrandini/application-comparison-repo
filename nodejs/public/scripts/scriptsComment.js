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

            const commentId = form.getAttribute('data-comment-id');
            const postId = form.getAttribute('data-post-id');
            const formData = new FormData(form);

            const data = {
                id_comment: parseInt(formData.get('id_comment'), 10),
                comment: formData.get('comment'),
                post_id: parseInt(postId, 10),
                user_id: parseInt(formData.get('p_id_user'), 10)
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

    const deleteCommentButtons = document.querySelectorAll('.delete-comment-button');
    deleteCommentButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const commentId = button.getAttribute('data-comment-id');
            const response = await fetch('/delete-comment', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${getCookie('token')}`
                },
                body: `comment_id=${commentId}`
            });

            if (response.ok) {
                alert('Comment deleted successfully');
                location.reload();
            } else {
                const result = await response.json();
                alert(`Error: ${result.error}`);
            }
        });
    });

});
