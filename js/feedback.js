document.addEventListener('DOMContentLoaded', () => {
    const feedbackIcon = document.getElementById('feedback-icon');
    const feedbackDialog = document.getElementById('feedback-dialog');
    const feedbackSendButton = document.getElementById('feedback-send-button');
    const feedbackInput = document.getElementById('feedback-input');
    const nameInput = document.getElementById('feedback-name');
    const contactInput = document.getElementById('feedback-contact');

    // Show the dialog when the icon is clicked
    feedbackIcon.addEventListener('click', () => {
        feedbackDialog.classList.remove('hidden');
    });

    feedbackDialog.addEventListener('click', (event) => {
    // If user clicked the backdrop, hide the dialog
    if (event.target === feedbackDialog) {
        feedbackDialog.classList.add('hidden');
    }
    });

    // Send the feedback to your backend
    feedbackSendButton.addEventListener('click', async () => {
        const feedbackText = feedbackInput.value.trim();
        if (!feedbackText) return;

        const payload = {
            feedback: feedbackText,
            name: nameInput.value.trim() || undefined,
            contact: contactInput.value.trim() || undefined
        };
        
        try {
            // Use a POST request with JSON body
            fetch('https://ntbvju14ce.execute-api.us-east-1.amazonaws.com/dev/submitFeedback', {
                method: 'POST',
                body: JSON.stringify(payload)
            })
            .then(response => {
                // Optionally, you can check if (!response.ok) throw ...
                return response.json();
            })
            .then(data => {
                alert('Thanks for your feedback!');
                feedbackInput.value = '';
                nameInput.value = '';
                contactInput.value = '';
                feedbackDialog.classList.add('hidden');
            })
            .catch(error => {
                console.error('Error submitting feedback:', error);
                alert('Something went wrong. Please try again later.');
            });
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Something went wrong. Please try again later.');
        }
    });
});
