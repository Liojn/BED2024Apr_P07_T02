document.addEventListener('DOMContentLoaded', async () => {
    const feedbackDetails = JSON.parse(localStorage.getItem('selectedFeedback'));
    const token = localStorage.getItem('token');
    const UserID = localStorage.getItem('userId');

    if (window.location.pathname.endsWith('FeedbackResponse.html')) {
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

            const responsePayload = {
                UserID: UserID,
                Fid: feedbackDetails.Fid,
                justification: responseType,
                response: responseText,
                seen: 'N',
                date: new Date().toISOString().split('T')[0]
            };

            try {
                const notificationResponse = await fetch('/notifications', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(responsePayload),
                });

                const feedbackUpdateResponse = await fetch(`/feedbacks/${feedbackDetails.Fid}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (notificationResponse.ok && feedbackUpdateResponse.ok) {
                    alert('Response sent and feedback updated successfully!');
                    window.location.href = 'FeedbackStaff.html';
                } else {
                    console.error('Failed to send response or update feedback:', notificationResponse.statusText, feedbackUpdateResponse.statusText);
                }
            } catch (error) {
                console.error('Error sending response or updating feedback:', error);
            }
        });
    }
});