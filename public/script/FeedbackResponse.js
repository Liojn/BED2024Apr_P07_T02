document.addEventListener('DOMContentLoaded', () => {
    const feedbackDetails = JSON.parse(localStorage.getItem('selectedFeedback'));
    const token = localStorage.getItem('token');
    const UserID = localStorage.getItem('userId'); // Retrieve UserID from local storage

    console.log(UserID)
    console.log('Feedback Details:', feedbackDetails);

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

            // Debugging logs
            console.log('UserID:', UserID);
            console.log('Fid:', feedbackDetails.Fid);
            console.log('Justification:', responseType);
            console.log('Response:', responseText);

            const responsePayload = {
                UserID: UserID, // UserID from local storage
                Fid: feedbackDetails.Fid, // Directly use Fid from feedbackDetails
                justification: responseType, // Ensure the justification type is captured correctly
                response: responseText,
                seen: 'N',
                date: new Date().toISOString().split('T')[0] // Format date to YYYY-MM-DD
            };

            try {
                const notificationResponse = await fetch('/notifications', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // Include token in request headers
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
                    window.location.href = 'FeedbackStaff.html'; // Redirect back to feedback list
                } else {
                    console.error('Failed to send response or update feedback:', notificationResponse.statusText, feedbackUpdateResponse.statusText);
                }
            } catch (error) {
                console.error('Error sending response or updating feedback:', error);
            }
        });
    }

    // Fetch notifications
    async function fetchNotifications() {
        const username = localStorage.getItem('username');
        const token = localStorage.getItem('token'); // Ensure token is retrieved here if not in global scope

        console.log(username);

        try {
            const response = await fetch(`/notifications/userNotif/${username}`, {
                headers: {
                    'Authorization': `Bearer ${token}`, // Include token in request headers
                    'Content-Type': 'application/json'
                }
            });

            console.log(response);

            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }

            const notifications = await response.json();

            console.log(notifications);

            // Check if the response is an array
            if (!Array.isArray(notifications)) {
                throw new Error('Response is not an array');
            }

            const notificationContainer = document.getElementById('notificationContainer');
            notificationContainer.innerHTML = ''; // Clear existing notifications

            notifications.forEach(notification => {
                const notificationBox = document.createElement('div');
                notificationBox.classList.add('notification-box');
                notificationBox.id = `notification-${notification.notification_id}`; // Set unique id

                notificationBox.innerHTML = `
                    <h1>Feedback title: ${notification.Title}</h1>
                    <h2>Response Justification: ${notification.justification}</h2>
                    <h3>Date: ${new Date(notification.date).toLocaleDateString()}</h3>
                    <button class="delete-btn" onclick="confirmDelete(${notification.notification_id})">Delete</button>
                `;

                notificationContainer.appendChild(notificationBox);
            });
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }

    // Check if the current page is NotificationScreen.html
    if (window.location.pathname.endsWith('NotificationScreen.html')) {
        fetchNotifications();
    }

});

function confirmDelete(notification_id) {
    if (confirm('Are you sure you want to delete this notification?')) {
        deleteNotification(notification_id);
    }
}

async function deleteNotification(notification_id) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/notifications/${notification_id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`, // Include token in request headers
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert('Notification deleted successfully!');
            document.getElementById(`notification-${notification_id}`).remove(); // Remove notification from DOM
        } else {
            throw new Error('Failed to delete notification');
        }
    } catch (error) {
        console.error('Error deleting notification:', error);
        alert('An error occurred while deleting the notification.');
    }
}
