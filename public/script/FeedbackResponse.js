document.addEventListener('DOMContentLoaded', () => {
    const feedbackDetails = JSON.parse(localStorage.getItem('selectedFeedback'));

    if (feedbackDetails) {
        const feedbackContainer = document.getElementById('feedback-details');
        feedbackContainer.innerHTML = `
            <h1>Title: ${feedbackDetails.title}</h1>
            <h2>Username: ${feedbackDetails.username}</h2>
            <h3>Email: ${feedbackDetails.email}</h3>
            <hr>
            <h3>Description:</h3>
            <p>${feedbackDetails.feedback}</p>
        `;
    }

    const responseForm = document.getElementById('response-form');
    responseForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const responseText = document.getElementById('response').value;
        const responseType = document.getElementById('response-type').value;
        const token = localStorage.getItem('token');

        const responsePayload = {
            ...feedbackDetails,
            response: responseText,
            responseType: responseType,
            date: new Date().toISOString()
        };

        try {
            const response = await fetch('/feedbacks/respond', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Include token in request headers
                },
                body: JSON.stringify(responsePayload),
            });

            if (response.ok) {
                alert('Response sent successfully!');
                window.location.href = 'FeedbackStaff.html'; // Redirect back to feedback list
            } else {
                console.error('Failed to send response:', response.statusText);
            }
        } catch (error) {
            console.error('Error sending response:', error);
        }
    });
});
