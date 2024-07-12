document.addEventListener('DOMContentLoaded', () => {
    const formattedDate = document.querySelectorAll('.formatDate');

    formattedDate.forEach(dateElement => {
        const originalDate = dateElement.textContent; 
        const formattedDate = new Date(originalDate).toLocaleDateString('pt-BR'); 
        dateElement.textContent = formattedDate; 
    });
});