const socket = io();

// Affichage d'un nouveau quiz
socket.on('new-quiz', (quizData) => {
    document.getElementById('quiz-container').style.display = 'block';
    document.getElementById('quiz-question').textContent = quizData.question;

    const optionsDiv = document.getElementById('quiz-options');
    optionsDiv.innerHTML = '';
    quizData.options.forEach((option) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.onclick = () => submitVote(quizData.quizId, option);
        optionsDiv.appendChild(button);
    });
});

// Envoyer un vote
function submitVote(quizId, option) {
    socket.emit('vote', { quizId, option });
    alert('Vote envoyé !');
}

// Affichage des résultats en temps réel
socket.on('quiz-results', (results) => {
    document.getElementById('quiz-results').style.display = 'block';
    document.getElementById('results-container').textContent = JSON.stringify(results.responses, null, 2);
});
