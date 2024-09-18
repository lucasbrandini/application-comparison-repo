document.addEventListener("DOMContentLoaded", function () {
  const preview = document.getElementById("preview");
  const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
  const validVideoTypes = ["video/mp4"];
  const img = document.createElement("img");
  const video = document.createElement("video");

  // Função para limpar o preview
  function clearFileInput(event) {
    event.preventDefault();
    // Limpar preview de imagem e vídeo
    img.src = "";
    video.src = "";
    preview.innerHTML = ""; // Limpar o conteúdo do preview
  }

  // Verificar se os elementos existem antes de adicionar event listeners
  const clearButton = document.getElementById("clearButton");
  const fileInput = document.getElementById("file");
  const form = document.getElementById("edit-post-form");

  if (clearButton) {
    clearButton.addEventListener("click", clearFileInput);
  }

  if (fileInput) {
    fileInput.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (file) {
        const fileType = file.type;
        clearFileInput(event);

        if (validImageTypes.includes(fileType)) {
          img.src = URL.createObjectURL(file);
          img.style.maxWidth = "100%";
          preview.appendChild(img);
        } else if (validVideoTypes.includes(fileType)) {
          video.src = URL.createObjectURL(file);
          video.controls = true;
          video.style.maxWidth = "100%";
          preview.appendChild(video);
        } else {
          preview.textContent = "Formato de arquivo não suportado.";
        }
      }
    });
  }

  const form = document.getElementById("editPostForm");

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      // Criação de FormData para pegar todos os campos do formulário
      const formData = new FormData(form);

      // Pegue o valor do campo post_id diretamente do formulário
      const postId = document.getElementById("post_id").value;
      formData.set("post_id", postId); // Forçando a inclusão do post_id

      fetch("/editpost", {
        method: "PUT",
        body: formData, // Enviando os dados do formulário como FormData
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((error) => {
              throw error;
            });
          }
          return response.json();
        })
        .then((data) => {
          // Redirecionar em caso de sucesso
          window.location.href = "/home";
        })
        .catch((error) => {
          console.error("Error:", error);
          // Tratamento de erro
        });
    });
  }
});
