document.addEventListener('DOMContentLoaded', () => {
    const addQuestionForm = document.getElementById('addQuestionForm');
    const adminMessageArea = document.getElementById('adminMessageArea');
    const existingQuestionsTableBody = document.querySelector('#existingQuestionsTable tbody'); // More specific selector

    // Function to get admin_key from query params for API calls
    function getAdminKey() {
        const params = new URLSearchParams(window.location.search);
        return params.get('admin_key');
    }

    if (addQuestionForm) {
        addQuestionForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(addQuestionForm);
            const text = formData.get('text');
            const options = [
                formData.get('option1'),
                formData.get('option2'),
                formData.get('option3'),
                formData.get('option4')
            ].filter(opt => opt && opt.trim() !== ''); // Collect non-empty options
            const correctAnswer = formData.get('correct_answer');

            if (options.length < 2) {
                adminMessageArea.textContent = 'Please provide at least two options.';
                adminMessageArea.style.color = 'red';
                return;
            }
            if (!options.includes(correctAnswer)) {
                adminMessageArea.textContent = 'The correct answer must match one of the provided options.';
                adminMessageArea.style.color = 'red';
                return;
            }

            const adminKey = getAdminKey();
            if (!adminKey) {
                adminMessageArea.textContent = 'Admin key missing from URL.';
                adminMessageArea.style.color = 'red';
                return;
            }

            try {
                const response = await fetch(`/admin/questions/add?admin_key=${adminKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text, options, correct_answer: correctAnswer })
                });
                const result = await response.json();
                if (response.ok) {
                    adminMessageArea.textContent = result.message || 'Question added successfully!'; // API returns question object, not message
                    adminMessageArea.style.color = 'green';
                    if (result.id) { // Check if question object with id is returned
                         adminMessageArea.textContent = `Question "${result.text.substring(0,30)}..." added successfully!`;
                    }
                    addQuestionForm.reset();
                    // Optionally, refresh the questions list or add the new question dynamically
                    setTimeout(() => window.location.reload(), 1000); // Simple reload for now
                } else {
                    adminMessageArea.textContent = `Error: ${result.detail || 'Could not add question.'}`;
                    adminMessageArea.style.color = 'red';
                }
            } catch (error) {
                console.error('Error adding question:', error);
                adminMessageArea.textContent = 'An unexpected error occurred.';
                adminMessageArea.style.color = 'red';
            }
        });
    }

    if (existingQuestionsTableBody) {
        existingQuestionsTableBody.addEventListener('click', async (event) => {
            if (event.target.classList.contains('deleteQuestionBtn')) {
                const button = event.target;
                const questionId = button.dataset.questionId;
                if (!questionId) return;

                if (!confirm('Are you sure you want to delete this question?')) return;

                const adminKey = getAdminKey();
                if (!adminKey) {
                    alert('Admin key missing from URL.');
                    return;
                }
                
                try {
                    const response = await fetch(`/admin/questions/${questionId}/delete?admin_key=${adminKey}`, {
                        method: 'POST',
                    });
                    const result = await response.json();
                    if (response.ok) {
                        alert(result.message || 'Question deleted successfully.');
                        // Remove the row from the table or reload
                        button.closest('tr').remove(); 
                    } else {
                        alert(`Error: ${result.detail || 'Could not delete question.'}`);
                    }
                } catch (error) {
                    console.error('Error deleting question:', error);
                    alert('An unexpected error occurred while deleting.');
                }
            }
        });
    }
});
