document.getElementById('edit-post-form').addEventListener('submit', function(event) {
  event.preventDefault();
  
  const post_id = document.getElementById('post_id').value;
  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;
  console.log('post_id', post_id, 'title', title, 'content', content)

  ///edit-post?post_id=${postId}
  fetch('/editpost', {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          post_id: post_id,
          title: title,
          content: content
      })
  })
  .then(response => {
    console.log(response)
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