document
  .getElementById("change-username-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const username = document.getElementById("username").value;

    fetch("/change-username", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username }),
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
        window.location.href = "/home";
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });

document.addEventListener("DOMContentLoaded", function () {
  const links = document.querySelectorAll(".list-config a");
  const sections = document.querySelectorAll(".content-item");

  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);
      window.scrollTo({
        top: targetElement.offsetTop,
        behavior: "smooth",
      });
    });
  });

  window.addEventListener("scroll", function () {
    let current = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      if (pageYOffset >= sectionTop - 60) {
        current = section.getAttribute("id");
      }
    });

    links.forEach((link) => {
      link.parentElement.classList.remove("active");
      if (link.getAttribute("href").substring(1) === current) {
        link.parentElement.classList.add("active");
      }
    });
  });
});

const validImageTypes = ["image/jpeg", "image/png", "image/gif"];

document.querySelector(".edit-icon").addEventListener("click", function () {
  document.getElementById("avatar").click();
});

document.getElementById("avatar").addEventListener("change", function () {
  const file = this.files[0];

  if (file && validImageTypes.includes(file.type)) {
    const reader = new FileReader();
    reader.onload = function (e) {
      document.querySelector(".avatar-image").src = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    alert("Por favor, selecione um arquivo de imagem válido (JPEG, PNG, GIF).");
    this.value = "";
  }
});
document
  .getElementById("change-avatar")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const avatarInput = document.getElementById("avatar");
    const file = avatarInput.files[0];

    if (file && validImageTypes.includes(file.type)) {
      const formData = new FormData();
      formData.append("avatar", file);

      fetch("/update-avatar", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${document.cookie.replace(
            /(?:(?:^|.*;\s*)jwt_token\s*\=\s*([^;]*).*$)|^.*$/,
            "$1"
          )}`,
        },
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            return response.text().then((text) => {
              console.error("Error Response:", text);
              throw new Error("Error response");
            });
          }
          return response.json();
        })
        .then((data) => {
          alert("Avatar atualizado com sucesso!");
          window.location.href = "/home";
        })
        .catch((error) => {
          console.error("Erro:", error);
          alert("Houve um erro ao atualizar o avatar.");
        });
    } else {
      alert(
        "Por favor, selecione um arquivo de imagem válido (JPEG, PNG, GIF)."
      );
    }
  });

const saveButton = document.getElementById("save-button");
const avatarInput = document.getElementById("avatar");

avatarInput.addEventListener("change", function () {
  const file = this.files[0];

  if (file && validImageTypes.includes(file.type)) {
    const reader = new FileReader();
    reader.onload = function (e) {
      document.querySelector(".avatar-image").src = e.target.result;
      saveButton.style.display = "inline-block";
    };
    reader.readAsDataURL(file);
  } else {
    alert("Por favor, selecione um arquivo de imagem válido (JPEG, PNG, GIF).");
    this.value = "";
    saveButton.style.display = "none";
  }
});