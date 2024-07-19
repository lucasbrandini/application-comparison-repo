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

var userVote = document.querySelectorAll('.userVoteText');

userVote.forEach(function (userVoteElement) {
    console.log(userVoteElement.innerHTML);
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

