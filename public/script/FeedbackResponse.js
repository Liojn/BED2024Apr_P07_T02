// Execute the following code once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Retrieve selected feedback details and user token from localStorage
    const feedbackDetails = JSON.parse(localStorage.getItem('selectedFeedback'));
    const token = localStorage.getItem('token');
    const UserID = localStorage.getItem('userId');

    // Update the notification count on page load
    updateNotificationCount();

    // Check if the current page is FeedbackResponse.html
    if (window.location.pathname.endsWith('FeedbackResponse.html')) {
        // If feedback details are available, display them in the feedback container
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

        // Add event listener to the response form for form submission
        const responseForm = document.getElementById('response-form');
        responseForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            // Get the response text and type from the form
            const responseText = document.getElementById('response').value;
            const responseType = document.getElementById('response-type').value;

            // Create the response payload
            const responsePayload = {
                UserID: UserID,
                Fid: feedbackDetails.Fid,
                justification: responseType,
                response: responseText,
                seen: 'N',
                date: new Date().toISOString().split('T')[0] // Format date as YYYY-MM-DD
            };

            try {
                // Send the response payload to the notifications endpoint
                const notificationResponse = await fetch('/notifications', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(responsePayload),
                });

                // Update the feedback status
                const feedbackUpdateResponse = await fetch(`/feedbacks/${feedbackDetails.Fid}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });

                // Check if both requests were successful
                if (notificationResponse.ok && feedbackUpdateResponse.ok) {
                    alert('Response sent and feedback updated successfully!');
                    window.location.href = 'FeedbackStaff.html'; // Redirect to FeedbackStaff.html
                } else {
                    alert("Character limit exceeded.");
                    console.error('Failed to send response or update feedback:', notificationResponse.statusText, feedbackUpdateResponse.statusText);
                }
            } catch (error) {
                console.error('Error sending response or updating feedback:', error);
            }
        });
    }

    // Function to update the notification count
    async function updateNotificationCount() {
        const username = localStorage.getItem('username');
        const token = localStorage.getItem('token'); // Retrieve token from local storage

        try {
            // Fetch notifications for the current user
            const response = await fetch(`/notifications/userNotif/${username}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Check for errors in the fetch response
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const notifications = await response.json();
            const unseenCount = notifications.filter(notification => notification.seen === 'N').length;

            // Update the notification count display
            const notificationCountElement = document.getElementById('notification-count');
            if (unseenCount > 0) {
                notificationCountElement.style.display = 'inline';
                notificationCountElement.textContent = unseenCount;
            } else {
                notificationCountElement.style.display = 'none';
            }
        } catch (error) {
            console.error('Fetch error:', error);

            // Handle different error scenarios
            if (error.message.includes('Token has expired')) {
                alert('Session expired. Please log in again.');
                localStorage.removeItem('token'); // Clear the token
                window.location.href = '../Index.html'; // Redirect to login page
            } else if (error.message.includes('Invalid token')) {
                alert('Invalid token. Please log in again.');
                localStorage.removeItem('token'); // Clear the token
                window.location.href = '../Index.html'; // Redirect to login page
            } else if (error.message.includes('Forbidden')) {
                alert('You do not have permission to access this resource.');
                window.location.href = '../html/homePage.html'; // Redirect to home page
            } else {
                alert(`An error occurred: ${error.message} `);
            }
        }
    }
});
