function addOption() {
    const optionsDiv = document.getElementById('quiz-options-inputs');
    const newOption = document.createElement('input');
    newOption.type = 'text';
    newOption.className = 'quiz-option';
    newOption.placeholder = `Option ${optionsDiv.children.length + 1}`;
    optionsDiv.appendChild(newOption);
}

function createQuiz() {
    const question = document.getElementById('quiz-question-input').value;
    const options = Array.from(document.getElementsByClassName('quiz-option')).map(input => input.value);

    if (!question || options.some(option => !option)) {
        alert('Veuillez remplir tous les champs.');
        return;
    }

    // Envoi au serveur
    fetch('/create-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, options })
    })
        .then(response => response.json())
        .then(data => {
            alert(`Quiz créé avec succès ! ID : ${data.quizId}`);
            socket.emit('send-quiz', { quizId: data.quizId, question, options });
        })
        .catch(err => console.error('Erreur lors de la création du quiz :', err));
}
