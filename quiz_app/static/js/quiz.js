document.addEventListener('DOMContentLoaded', () => {
    const timeLeftDisplay = document.getElementById('timeLeft');
    const currentScoreDisplay = document.getElementById('currentScore');
    const questionTextDisplay = document.getElementById('questionText');
    const answerOptionsContainer = document.getElementById('answerOptions');
    const feedbackArea = document.getElementById('feedbackArea');

    let totalQuizTime = 60; // seconds
    let timerInterval;
    let currentQuestionStartTime;
    let score = 0;
    let userEmail = localStorage.getItem('quizUserEmail');

    if (!userEmail) {
        // Redirect to home if no user email (e.g. direct navigation to /quiz)
        window.location.href = '/';
        return;
    }

    function startTimer() {
        timeLeftDisplay.textContent = totalQuizTime;
        timerInterval = setInterval(() => {
            totalQuizTime--;
            timeLeftDisplay.textContent = totalQuizTime;
            if (totalQuizTime <= 0) {
                clearInterval(timerInterval);
                endQuiz();
            }
        }, 1000);
    }

    async function fetchQuestion() {
        feedbackArea.textContent = '';
        answerOptionsContainer.innerHTML = ''; // Clear previous options
        try {
            const response = await fetch('/quiz/question');
            if (!response.ok) {
                const error = await response.json();
                if (response.status === 404) { // No more questions
                     feedbackArea.textContent = error.detail || "No more questions!";
                     setTimeout(endQuiz, 2000);
                } else {
                     throw new Error(error.detail || 'Failed to fetch question');
                }
                return;
            }
            const question = await response.json();
            displayQuestion(question);
            currentQuestionStartTime = Date.now();
        } catch (error) {
            console.error('Error fetching question:', error);
            questionTextDisplay.textContent = 'Error loading question. Try refreshing.';
        }
    }

    function displayQuestion(question) {
        questionTextDisplay.textContent = question.text;
        question.options.forEach(optionText => {
            const button = document.createElement('button');
            button.textContent = optionText;
            button.onclick = () => submitAnswer(question.id, optionText, button);
            answerOptionsContainer.appendChild(button);
        });
    }

    async function submitAnswer(questionId, selectedAnswer, buttonEl) {
        // Disable all option buttons
        const buttons = answerOptionsContainer.getElementsByTagName('button');
        for (let btn of buttons) {
            btn.disabled = true;
        }

        const timeTakenSeconds = Math.max(1, Math.floor((Date.now() - currentQuestionStartTime) / 1000));
        
        try {
            const response = await fetch('/quiz/answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question_id: questionId,
                    selected_answer: selectedAnswer,
                    time_taken_seconds: timeTakenSeconds
                })
            });
            if (!response.ok) throw new Error('Failed to submit answer');
            
            const result = await response.json();
            score += result.points_awarded;
            currentScoreDisplay.textContent = score;

            if (result.correct) {
                feedbackArea.textContent = `Correct! +${result.points_awarded} points`;
                feedbackArea.style.color = 'green';
                buttonEl.classList.add('correct');
            } else {
                feedbackArea.textContent = `Incorrect. Correct was: ${result.correct_answer}`;
                feedbackArea.style.color = 'red';
                buttonEl.classList.add('incorrect');
                // Highlight correct answer
                for (let btn of buttons) {
                    if (btn.textContent === result.correct_answer) {
                        btn.classList.add('correct');
                        break;
                    }
                }
            }
            
            setTimeout(fetchQuestion, 2000); // Load next question after 2 seconds
        } catch (error) {
            console.error('Error submitting answer:', error);
            feedbackArea.textContent = 'Error submitting answer.';
            // Re-enable buttons if submission fails and no new question is loaded
             setTimeout(() => {
                 for (let btn of buttons) {
                     btn.disabled = false;
                     btn.classList.remove('correct', 'incorrect');
                 }
                 feedbackArea.textContent = '';
             }, 1500);
        }
    }

    async function endQuiz() {
        clearInterval(timerInterval);
        timeLeftDisplay.textContent = '0';
        feedbackArea.textContent = "Time's up! Calculating score...";
        answerOptionsContainer.innerHTML = ''; // Clear options

        try {
            const response = await fetch('/quiz/end', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, final_score: score })
            });
            if (!response.ok) throw new Error('Failed to end quiz on server');
            
            const resultData = await response.json();
            localStorage.setItem('lastQuizScore', resultData.final_score);
            localStorage.setItem('quizUserHighScore', resultData.high_score); // Update high score
            window.location.href = '/summary'; // Redirect to summary page
        } catch (error) {
            console.error('Error ending quiz:', error);
            feedbackArea.textContent = 'Error saving score. Your score was ' + score;
            // Still redirect, or offer a retry? For now, just redirect.
            localStorage.setItem('lastQuizScore', score); // Save locally at least
            setTimeout(() => window.location.href = '/summary', 2000);
        }
    }

    // Initial setup
    startTimer();
    fetchQuestion();
    currentScoreDisplay.textContent = score;
});
