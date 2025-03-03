document.addEventListener('DOMContentLoaded', () => {
    const feedbackIcon = document.getElementById('feedback-icon');
    const feedbackDialog = document.getElementById('feedback-dialog');
    const feedbackSendButton = document.getElementById('feedback-send-button');
    const feedbackInput = document.getElementById('feedback-input');

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

    try {
        await fetch('https://ntbvju14ce.execute-api.us-east-1.amazonaws.com/dev/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feedback: feedbackText })
        });
        alert('Thanks for your feedback!');
        feedbackInput.value = '';
        feedbackDialog.classList.add('hidden');
    } catch (error) {
        console.error('Error submitting feedback:', error);
        alert('Something went wrong. Please try again later.');
    }
    });
});
