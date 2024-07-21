
document.addEventListener('DOMContentLoaded', () => {
    updateNotificationCount();
    const feedbackDetails = JSON.parse(localStorage.getItem('selectedFeedback'));
    const NotificationId = localStorage.getItem('notificationId')
    const token = localStorage.getItem('token');
    const UserID = localStorage.getItem('userId'); // Retrieve UserID from local storage
    const date = localStorage.getItem('date');
    const username = localStorage.getItem('username');
    const staffName = localStorage.getItem('staffName')

    console.log(UserID);
    console.log(NotificationId)
    console.log('Feedback Details:', feedbackDetails);
    

    if (window.location.pathname.endsWith('NotificationDetails.html')) {
        const selectedNotification = JSON.parse(localStorage.getItem('selectedNotification'));
        if (selectedNotification && feedbackDetails) {
            document.querySelector('div[style="width: 50%; padding: 1rem;"]:first-of-type').innerHTML = `
                <div style="height: 100%; border: 1px solid #e2e8f0; border-radius: 0.5rem;">
                    <div style="padding: 1rem;">
                        <h2 style="font-size: 1.5rem;">Feedback Details</h2>
                    </div>
                    <div style="padding: 1rem; space-y: 1rem;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div>
                                <p style="font-weight: bold;">${username}</p>
                                <p style="font-size: 0.875rem; color: #6b7280;">${new Date(date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <p style="font-size: 1.125rem;">${feedbackDetails.feedback}</p>
                    </div>
                </div>
            `;

            document.querySelector('div[style="width: 50%; padding: 1rem;"]:last-of-type').innerHTML = `
                <div style="height: 100%; border: 1px solid #e2e8f0; border-radius: 0.5rem;">
                    <div style="padding: 1rem;">
                        <h2 style="font-size: 1.5rem;">Staff Response</h2>
                    </div>
                    <div style="padding: 1rem;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div>
                                <p style="font-weight: bold;">${staffName}</p>
                                <p style="font-size: 0.875rem; color: #6b7280;">${new Date(selectedNotification.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <p style="font-size: 1.125rem; font-weight: bold; color: #3b82f6;">${selectedNotification.response}</p>
                    </div>
                </div>
            `;
        }
    }

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

    if (window.location.pathname.endsWith('NotificationScreen.html')) {
        fetchNotificationsDetails();
    }
});

async function fetchNotificationsDetails() {
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`/notifications/userNotif/${username}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

       
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        const notifications = await response.json();

        if (!Array.isArray(notifications)) {
            throw new Error('Response is not an array');
        }

        // Store notifications in localStorage
        localStorage.setItem('notifications', JSON.stringify(notifications));
        console.log(notifications)

        const notificationContainer = document.getElementById('notificationContainer');
        notificationContainer.innerHTML = ''; // Clear existing notifications

        notifications.forEach(notification => {
            const notificationBox = document.createElement('div');
            notificationBox.classList.add('notification-box');
            notificationBox.id = `notification-${notification.notification_id}`;

            notificationBox.innerHTML = `
                <h1>Feedback title: ${notification.Title}</h1>
                <h2>Response Justification: ${notification.justification}</h2>
                <h3>Date: ${new Date(notification.date).toLocaleDateString()}</h3>
                <hr>
                <button class="details-btn" onclick="viewNotificationDetails(${notification.notification_id})">See More Details</button>
                <button class="delete-btn" onclick="confirmDelete(${notification.notification_id})">Delete</button>
            `;

            notificationContainer.appendChild(notificationBox);
        });

    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
}

function viewNotificationDetails(notification_id) {
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    const notification = notifications.find(n => n.notification_id === notification_id);
    
    if (notification) {
        localStorage.setItem('selectedNotification', JSON.stringify(notification));
        localStorage.setItem('notificationId', notification_id.toString());
        window.location.href = 'NotificationDetails.html';
    } else {
        console.error('Notification not found');
        alert('Notification details not available');
    }
}

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
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert('Notification deleted successfully!');
            document.getElementById(`notification-${notification_id}`).remove();
        } else {
            throw new Error('Failed to delete notification');
        }
    } catch (error) {
        console.error('Error deleting notification:', error);
        alert('An error occurred while deleting the notification.');
    }
}

async function updateNotificationCount() {  
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`/notifications/userNotif/${username}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
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
        console.error('Error fetching notifications:', error);
    }
}
