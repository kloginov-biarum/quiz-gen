document.addEventListener('DOMContentLoaded', () => {
    const emailForm = document.getElementById('emailForm');
    const playButton = document.getElementById('playButton');
    const messageArea = document.getElementById('messageArea');
    const emailInput = document.getElementById('email');

    if (emailForm) {
        emailForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = emailInput.value;
            if (!email) {
                messageArea.textContent = 'Please enter your email.';
                messageArea.classList.remove('success');
                messageArea.classList.add('error');
                return;
            }

            playButton.disabled = true;
            messageArea.textContent = 'Starting...';
            messageArea.classList.remove('error', 'success'); // Neutral message

            try {
                const formData = new FormData();
                formData.append('email', email);

                const response = await fetch('/start_quiz', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const userData = await response.json();
                    localStorage.setItem('quizUserEmail', userData.email); // Store email
                    localStorage.setItem('quizUserHighScore', userData.high_score);
                    // Clear any quiz specific data from previous sessions
                    localStorage.removeItem('currentQuizScore');
                    localStorage.removeItem('quizStartTime');
                    // Indicate successful start before redirecting (optional, as redirect is fast)
                    messageArea.textContent = 'Quiz started! Redirecting...';
                    messageArea.classList.remove('error');
                    messageArea.classList.add('success');
                    window.location.href = '/quiz'; // Redirect to quiz page
                } else {
                    const errorData = await response.json();
                    messageArea.textContent = `Error: ${errorData.detail || 'Could not start quiz.'}`;
                    messageArea.classList.remove('success');
                    messageArea.classList.add('error');
                    playButton.disabled = false;
                }
            } catch (error) {
                console.error('Error starting quiz:', error);
                messageArea.textContent = 'An unexpected error occurred. Please try again.';
                messageArea.classList.remove('success');
                messageArea.classList.add('error');
                playButton.disabled = false;
            }
        });
    }
});
