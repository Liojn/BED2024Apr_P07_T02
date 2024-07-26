document.addEventListener('DOMContentLoaded', async () => {
    const feedbackDetails = JSON.parse(localStorage.getItem('selectedFeedback'));
    const token = localStorage.getItem('token');
    const UserID = localStorage.getItem('userId');
    updateNotificationCount()

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
                    alert("Character limited exceeded.")
                    console.error('Failed to send response or update feedback:', notificationResponse.statusText, feedbackUpdateResponse.statusText);
                }
            } catch (error) {
                console.error('Error sending response or updating feedback:', error);
            }
        });
    }

    async function updateNotificationCount() {  
        const username = localStorage.getItem('username');
        const token = localStorage.getItem('token'); // Retrieve token from local storage
    
        try {
            const response = await fetch(`/notifications/userNotif/${username}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
    
            const notifications = await response.json();
    
            const unseenCount = notifications.filter(notification => notification.seen === 'N').length;
    
            const notificationCountElement = document.getElementById('notification-count');
            if (unseenCount > 0) {
                notificationCountElement.style.display = 'inline';
                notificationCountElement.textContent = unseenCount;
            } else {
                notificationCountElement.style.display = 'none';
            }
            
        } catch (error) {
            console.error('Fetch error:', error);
    
            if (error.message.includes('Token has expired')) {
                alert('Session expired. Please log in again.');
                localStorage.removeItem('jwtToken'); // Clear the token
                window.location.href = '/login'; // Redirect to login page
            } else if (error.message.includes('Invalid token')) {
                alert('Invalid token. Please log in again.');
                localStorage.removeItem('jwtToken'); // Clear the token
                window.location.href = '/login'; // Redirect to login page
            } else if (error.message.includes('Forbidden')) {
                alert('You do not have permission to access this resource.');
                window.location.href = '/'; // Redirect to home page
            } else {
                alert(`An error occurred: ${error.message}`);
            }
        }
    }
});