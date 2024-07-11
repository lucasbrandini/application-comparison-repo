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

btn

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