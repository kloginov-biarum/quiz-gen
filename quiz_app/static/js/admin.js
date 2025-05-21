document.addEventListener('DOMContentLoaded', () => {
    const addQuestionForm = document.getElementById('addQuestionForm');
    const adminMessageArea = document.getElementById('adminMessageArea');
    const existingQuestionsTableBody = document.querySelector('#existingQuestionsTable tbody');

    function getAdminKey() {
        const params = new URLSearchParams(window.location.search);
        return params.get('admin_key');
    }

    if (addQuestionForm) {
        addQuestionForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            adminMessageArea.textContent = ''; // Clear previous messages
            adminMessageArea.classList.remove('success', 'error');

            const formData = new FormData(addQuestionForm);
            const text = formData.get('text');
            const options = [
                formData.get('option1'),
                formData.get('option2'),
                formData.get('option3'),
                formData.get('option4')
            ].filter(opt => opt && opt.trim() !== '');
            const correctAnswer = formData.get('correct_answer');

            if (options.length < 2) {
                adminMessageArea.textContent = 'Please provide at least two options.';
                adminMessageArea.classList.add('error');
                return;
            }
            if (!options.includes(correctAnswer)) {
                adminMessageArea.textContent = 'The correct answer must match one of the provided options.';
                adminMessageArea.classList.add('error');
                return;
            }

            const adminKey = getAdminKey();
            if (!adminKey) {
                adminMessageArea.textContent = 'Admin key missing from URL. Ensure it is in the address bar.';
                adminMessageArea.classList.add('error');
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
                    // API returns the question object on success
                    adminMessageArea.textContent = `Question "${result.text.substring(0,30)}..." added successfully!`;
                    adminMessageArea.classList.add('success');
                    addQuestionForm.reset();
                    setTimeout(() => window.location.reload(), 1200); // Reload to see new question in table
                } else {
                    adminMessageArea.textContent = `Error: ${result.detail || 'Could not add question.'}`;
                    adminMessageArea.classList.add('error');
                }
            } catch (error) {
                console.error('Error adding question:', error);
                adminMessageArea.textContent = 'An unexpected error occurred while adding the question.';
                adminMessageArea.classList.add('error');
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
                    // Using alert for critical errors not tied to adminMessageArea directly
                    alert('Admin key missing from URL. Cannot perform delete operation.');
                    return;
                }
                
                try {
                    const response = await fetch(`/admin/questions/${questionId}/delete?admin_key=${adminKey}`, {
                        method: 'POST',
                    });
                    const result = await response.json(); // Expect JSON response for success/failure
                    if (response.ok) {
                        alert(result.message || 'Question deleted successfully.'); // Use alert for confirmation of delete
                        button.closest('tr').remove(); 
                    } else {
                        alert(`Error: ${result.detail || 'Could not delete question.'}`);
                    }
                } catch (error) {
                    console.error('Error deleting question:', error);
                    alert('An unexpected error occurred while deleting the question.');
                }
            }
        });
    }
});
