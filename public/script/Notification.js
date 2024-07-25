document.addEventListener('DOMContentLoaded', async () => {
    updateNotificationCount();
    
    const NotificationId = localStorage.getItem('notificationId');
    const token = localStorage.getItem('token');
    const UserID = localStorage.getItem('userId');
    const date = localStorage.getItem('date');
    const username = localStorage.getItem('username');
    const feedbackDetails = JSON.parse(localStorage.getItem('selectedFeedback'));

    console.log(UserID);
    console.log(NotificationId);

    if (window.location.pathname.endsWith('NotificationDetails.html')) {
        console.log('On NotificationDetails page');
        await updateSeen();
        updateNotificationCount();

        const backButton = document.getElementById('backButton');
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.location.href = 'NotificationScreen.html';
            });
        }
        const selectedNotification = JSON.parse(localStorage.getItem('selectedNotification'));
        const staffUserId = localStorage.getItem('staffUserId');
        console.log('Selected Notification:', selectedNotification);
        console.log('Staff User ID:', staffUserId);

        if (selectedNotification && staffUserId) {
            try {
                const staffUser = await fetchStaffUsername(staffUserId);
                console.log('Staff User:', staffUser);
                
                // Update the HTML with the fetched data
                document.querySelector('div[style="width: 50%; padding: 1rem;"]:first-of-type').innerHTML = `
                <div style="height: 100%; border: 1px solid #e2e8f0; border-radius: 0.5rem;">
                    <div style="padding: 1rem;">
                        <h2 style="font-size: 1.5rem;">Feedback Details</h2>
                    </div>
                    <div style="padding: 1rem; space-y: 1rem;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div>
                                <p style="font-weight: bold;">User username:<br>${username}</p><br>
                                <p style="font-size: 0.875rem; color: #6b7280;">Date sent:<br>${new Date(date).toLocaleDateString()}</p><br>
                            </div>
                        </div>
                        <p style="font-size: 1.125rem;">Description:<br>${feedbackDetails.feedback}</p>
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
                                    <p style="font-weight: bold;">Staff Username:<br>${staffUser || 'Unknown Staff'}</p><br>
                                    <p style="font-size: 0.875rem; color: #6b7280;">Staff response date:<br>${new Date(selectedNotification.date).toLocaleDateString()}</p><br>
                                </div>
                            </div>
                            <p style="font-size: 1.125rem; font-weight: bold; color: #3b82f6;">Staff response:<br>${selectedNotification.response}</p>
                        </div>
                    </div>
                `;
            } catch (error) {
                console.error('Error setting up notification details:', error);
            }
        }
    }

    if (window.location.pathname.endsWith('NotificationScreen.html')) {
        console.log('Fetching notifications');
        await fetchNotificationsDetails(null);
        setupNotificationToggle();
    }
});

function setupNotificationToggle() {
    const allButton = document.getElementById('showAllNotifications');
    const unseenButton = document.getElementById('showUnseenNotifications');
    const seenButton = document.getElementById('showSeenNotifications');

    allButton.addEventListener('click', () => fetchNotificationsDetails(null));
    unseenButton.addEventListener('click', () => fetchNotificationsDetails('N'));
    seenButton.addEventListener('click', () => fetchNotificationsDetails('Y'));

    function setActiveButton(button) {
        [allButton, unseenButton, seenButton].forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    }

    allButton.addEventListener('click', () => setActiveButton(allButton));
    unseenButton.addEventListener('click', () => setActiveButton(unseenButton));
    seenButton.addEventListener('click', () => setActiveButton(seenButton));
}

async function fetchNotificationsDetails(seenStatus = null) {
    console.log('Inside fetchNotificationsDetails');
    const UserID = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    console.log('Username:', username);
    try {
        let url;
        if (seenStatus === null) {
            url = `/notifications/userNotif/${username}`;
        } else {
            url = `/notifications/seen/${seenStatus}/${username}`;
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Network response was not ok: ${response.statusText}. Details: ${errorText}`);
        }

        const notifications = await response.json();

        localStorage.setItem('notifications', JSON.stringify(notifications));

        const notificationContainer = document.getElementById('notificationContainer');

        if (!notificationContainer) {
            console.error('Notification container not found in the DOM');
            return;
        }

        notificationContainer.innerHTML = '';

        if (notifications.length === 0) {
            notificationContainer.innerHTML = '<p>No notifications found.</p>';
            return;
        }

        notifications.forEach((notification) => {
            const notificationBox = document.createElement('div');
            notificationBox.classList.add('notification-box');
            notificationBox.id = `notification-${notification.notification_id}`;

            notificationBox.innerHTML = `
                <h1>Feedback title:<br>${notification.Title || 'N/A'}</h1>
                <h2>Response Justification: ${notification.justification || 'N/A'}</h2>
                <h3>Date: ${new Date(notification.date).toLocaleDateString()}</h3>
                <p>Status: ${notification.seen === 'Y' ? 'Seen' : 'Unseen'}</p>
                <hr>
                <div class="button-container">
                    <button class="details-btn" onclick="viewNotificationDetails(${notification.notification_id})">See More Details</button>
                    <button class="delete-btn" onclick="confirmDelete(${notification.notification_id})">Delete</button>
                </div>
            `;

            notificationContainer.appendChild(notificationBox);
        });

    } catch (error) {
        console.error('Error fetching or processing notifications:', error);
        const notificationContainer = document.getElementById('notificationContainer');
        if (notificationContainer) {
            notificationContainer.innerHTML = `<p>Error loading notifications: ${error.message}</p>`;
        }
    }
}
function viewNotificationDetails(notification_id) {
    const notificationsString = localStorage.getItem('notifications');
    
    if (!notificationsString) {
        console.error('No notifications found in localStorage');
        alert('No notifications available');
        return;
    }
    
    const notifications = JSON.parse(notificationsString);
    const notification = notifications.find(n => n.notification_id === notification_id);
    console.log(notification);

    if (notification) {
        localStorage.setItem('selectedNotification', JSON.stringify(notification));
        localStorage.setItem('notificationId', notification_id.toString());
        localStorage.setItem('staffUserId', notification.UserID);
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
    console.log(notification_id)
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/notifications/${notification_id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log(response)
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
async function fetchStaffUsername(userId) {
    console.log("hi");
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/notifications/username/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);
        return data.Username;
    } catch (error) {
        console.error('Error fetching username:', error);
        return null;
    }
}

async function updateSeen() {
    const NotificationId = localStorage.getItem('notificationId');
    const token = localStorage.getItem('token');

    console.log('NotificationId:', NotificationId);

    if (!NotificationId) {
        console.error('No notification ID found');
        return;
    }

    try {
        const response = await fetch(`/notifications/seen/${NotificationId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        const updatedNotification = await response.json();
        console.log('Notification updated:', updatedNotification);
    } catch (error) {
        console.error('Error updating seen status:', error);
    }
}

