document.addEventListener('DOMContentLoaded', () => {
    const finalScoreDisplay = document.getElementById('finalScore');
    const highScoreDisplay = document.getElementById('highScore');

    const lastScore = localStorage.getItem('lastQuizScore');
    const userHighScore = localStorage.getItem('quizUserHighScore');

    if (finalScoreDisplay && lastScore !== null) {
        finalScoreDisplay.textContent = lastScore;
    } else if (finalScoreDisplay) {
        finalScoreDisplay.textContent = 'N/A';
    }

    if (highScoreDisplay && userHighScore !== null) {
        highScoreDisplay.textContent = userHighScore;
    } else if (highScoreDisplay) {
        highScoreDisplay.textContent = 'N/A';
    }
});
