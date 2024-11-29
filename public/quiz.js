// Fonction pour ouvrir l'interface de création de quiz
function openQuizInterface() {
    const quizModal = document.createElement('div');
    quizModal.id = 'quiz-modal';
    quizModal.innerHTML = `
        <div style="background: #fff; padding: 20px; border-radius: 5px; width: 300px;">
            <h3>Créer un Quiz</h3>
            <label>Question : </label>
            <input type="text" id="quiz-question" placeholder="Votre question" style="width: 100%; margin-bottom: 10px;">
            <label>Options (séparées par des virgules) :</label>
            <input type="text" id="quiz-options" placeholder="Option1, Option2, ..." style="width: 100%; margin-bottom: 10px;">
            <button id="send-quiz" style="background: blue; color: white; padding: 10px; border: none;">Envoyer le Quiz</button>
        </div>
    `;
    document.body.appendChild(quizModal);

    // Envoie le quiz lorsqu'on clique sur le bouton
    document.getElementById('send-quiz').addEventListener('click', () => {
        const question = document.getElementById('quiz-question').value;
        const options = document.getElementById('quiz-options').value.split(',').map(opt => opt.trim());

        if (question && options.length > 1) {
            // Envoie le quiz via Socket.IO
            socket.emit('send-quiz', { question, options });
            alert('Quiz envoyé!');
            document.body.removeChild(quizModal);
        } else {
            alert('Veuillez entrer une question et au moins deux options.');
        }
    });
}
