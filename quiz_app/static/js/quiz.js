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
        feedbackArea.classList.remove('success', 'error');
        answerOptionsContainer.innerHTML = ''; 
        try {
            const response = await fetch('/quiz/question');
            if (!response.ok) {
                const error = await response.json();
                if (response.status === 404) {
                     feedbackArea.textContent = error.detail || "No more questions!";
                     feedbackArea.classList.remove('success'); // Or neutral, but error might be more fitting if game ends unexpectedly
                     feedbackArea.classList.add('error'); // Or a specific class for "game-over-info"
                     setTimeout(endQuiz, 2000);
                } else {
                     feedbackArea.textContent = error.detail || 'Failed to fetch question';
                     feedbackArea.classList.remove('success');
                     feedbackArea.classList.add('error');
                     // Potentially throw to be caught by outer catch
                }
                return;
            }
            const question = await response.json();
            displayQuestion(question);
            currentQuestionStartTime = Date.now();
        } catch (error) {
            console.error('Error fetching question:', error);
            questionTextDisplay.textContent = 'Error loading question. Try refreshing.';
            feedbackArea.textContent = 'Error loading question.';
            feedbackArea.classList.remove('success');
            feedbackArea.classList.add('error');
        }
    }

    function displayQuestion(question) {
        questionTextDisplay.textContent = question.text;
        questionTextDisplay.classList.add('new-question');
        setTimeout(() => {
            questionTextDisplay.classList.remove('new-question');
        }, 500); // Match CSS animation duration

        question.options.forEach(optionText => {
            const button = document.createElement('button');
            button.textContent = optionText;
            button.onclick = () => submitAnswer(question.id, optionText, button);
            answerOptionsContainer.appendChild(button);
        });
    }

    async function submitAnswer(questionId, selectedAnswer, buttonEl) {
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
            if (!response.ok) { // Consider specific error handling if API can return useful details
                feedbackArea.textContent = 'Failed to submit answer. Please try again or wait.';
                feedbackArea.classList.remove('success');
                feedbackArea.classList.add('error');
                throw new Error('Failed to submit answer');
            }
            
            const result = await response.json();
            score += result.points_awarded;
            currentScoreDisplay.textContent = score;

            if (result.correct) {
                feedbackArea.textContent = `Correct! +${result.points_awarded} points`;
                feedbackArea.classList.remove('error');
                feedbackArea.classList.add('success');
                buttonEl.classList.add('correct');
            } else {
                feedbackArea.textContent = `Incorrect. Correct was: ${result.correct_answer}`;
                feedbackArea.classList.remove('success');
                feedbackArea.classList.add('error');
                buttonEl.classList.add('incorrect');
                for (let btn of buttons) {
                    if (btn.textContent === result.correct_answer) {
                        btn.classList.add('correct'); // Highlight the correct one
                        break;
                    }
                }
            }
            
            setTimeout(fetchQuestion, 2000);
        } catch (error) {
            console.error('Error submitting answer:', error);
            // feedbackArea.textContent set by if(!response.ok) or remains generic
            if (!feedbackArea.textContent || !feedbackArea.classList.contains('error')) {
                 feedbackArea.textContent = 'Error submitting answer.';
                 feedbackArea.classList.remove('success');
                 feedbackArea.classList.add('error');
            }
             setTimeout(() => { // Reset UI for next attempt if needed, or to allow user to see error
                 for (let btn of buttons) {
                     btn.disabled = false;
                     btn.classList.remove('correct', 'incorrect');
                 }
                 // feedbackArea.textContent = ''; // Don't clear error immediately
                 // feedbackArea.classList.remove('success', 'error');
             }, 1500);
        }
    }

    async function endQuiz() {
        clearInterval(timerInterval);
        timeLeftDisplay.textContent = '0';
        feedbackArea.textContent = "Time's up! Calculating score...";
        feedbackArea.classList.remove('error', 'success'); // Neutral for this message
        answerOptionsContainer.innerHTML = '';

        try {
            const response = await fetch('/quiz/end', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, final_score: score })
            });
            if (!response.ok) {
                feedbackArea.textContent = 'Error saving your score. Please try again later.';
                feedbackArea.classList.remove('success');
                feedbackArea.classList.add('error');
                throw new Error('Failed to end quiz on server');
            }
            
            const resultData = await response.json();
            localStorage.setItem('lastQuizScore', resultData.final_score);
            localStorage.setItem('quizUserHighScore', resultData.high_score);
            window.location.href = '/summary';
        } catch (error) {
            console.error('Error ending quiz:', error);
            // feedbackArea.textContent already set if response.ok was false
            if (!feedbackArea.classList.contains('error')) { // If error was from network or something else
                feedbackArea.textContent = 'Error saving score. Your score was ' + score;
                feedbackArea.classList.remove('success');
                feedbackArea.classList.add('error');
            }
            localStorage.setItem('lastQuizScore', score);
            setTimeout(() => window.location.href = '/summary', 2000);
        }
    }

    // Initial setup
    startTimer();
    fetchQuestion();
    currentScoreDisplay.textContent = score;
});
