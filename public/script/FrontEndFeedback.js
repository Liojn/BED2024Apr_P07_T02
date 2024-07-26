document.addEventListener('DOMContentLoaded', async () => {
    // Fetch initial feedbacks and update notification count on page load
    fetchFeedbacks('N');
    updateNotificationCount(); 

    // Helper function to format date in YYYY/MM/DD format
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    }

    // Retrieve account details from localStorage
    const accountType = localStorage.getItem('accountType');
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username'); 
    const email = localStorage.getItem('email'); 

    console.log(token);
    console.log(accountType);

    const staffButton = document.getElementById('staffButton');
    
    // Show staff button if account type is 'Staff', otherwise hide it
    if (accountType === 'Staff' && staffButton) {
        staffButton.style.display = 'block';
        staffButton.addEventListener('click', () => {
            window.location.href = 'FeedbackStaff.html'; 
        });
    } else {
        staffButton.style.display = 'none';
    }

    // Handle feedback form submission
    const feedbackForm = document.querySelector('.contact-left');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Collect form data and prepare the feedback object
            const formData = new FormData(feedbackForm);
            const feedbackData = {
                Username: username, 
                Email: email, 
                Title: formData.get('feedbackTitle'),
                Feedback: formData.get('feedback'),
                Verified: "N",
                Date: formatDate(new Date())
            };

            try {
                // Send feedback data to the server
                const response = await fetch('/feedbacks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify(feedbackData),
                });

                if (response.ok) {
                    alert('Feedback submitted successfully!');
                    feedbackForm.reset();
                    fetchFeedbacks(); // Update feedback list
                    await updateNotificationCount(); // Update the notification count
                } else {
                    console.error('Failed to submit feedback:', response.statusText);
                    alert("Character limit exceeded!")
                }
            } catch (error) {
                console.error('Error submitting feedback:', error);
            }
        });
    }
});

// Fetch feedbacks from the server and update the feedback container
async function fetchFeedbacks(filter = 'all') {
    try {
        const token = localStorage.getItem('token');
        let url;
        
        // Determine URL based on filter
        if (filter === 'all') {
            url = "/feedbacks";
        } else {
            url = `/feedbacks/verified/${filter}`;
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const feedbacks = await response.json();

        console.log('Fetched feedbacks:', feedbacks);

        // Check if the response is an array
        if (!Array.isArray(feedbacks)) {
            throw new Error('Response is not an array');
        }

        const feedbackContainer = document.getElementById('feedbackContainer');
        feedbackContainer.innerHTML = ''; // Clear existing feedbacks

        // Append each feedback to the container
        feedbacks.forEach(feedback => {
            const feedbackBox = document.createElement('div');
            feedbackBox.classList.add('feedback-box');
            feedbackBox.id = `feedback-${feedback.Fid}`; // Set unique id
            feedbackBox.innerHTML = `
                <h1>Title: ${feedback.title}</h1>
                <h2>Username: ${feedback.username}</h2>
                <h3>Email: ${feedback.email}</h3>
                <hr>
                <h3>Description:</h3>
                <p>${feedback.feedback}</p>
                <hr>
                <h4>Date sent: ${feedback.date}</h4>
                <div class="action-buttons">
                    <button class="delete-btn" onclick="confirmDelete(this)">Delete</button>
                    ${feedback.verified === 'N' ? `<button class="respond-btn" onclick="confirmRespond(this)">Respond</button>` : ''}
                </div>
            `;
            feedbackContainer.appendChild(feedbackBox);
        });
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
    }
}

// Update the notification count based on unseen notifications
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

// Filter feedbacks based on the selected filter value
function filterFeedbacks() {
    const filterValue = document.getElementById('filterDropdown').value;
    fetchFeedbacks(filterValue);
}

// Display delete confirmation modal and store the feedback ID to be deleted
function confirmDelete(button) {
    const modal = document.getElementById('deleteConfirmationModal');
    modal.style.display = 'block';
    modal.dataset.feedbackId = button.closest('.feedback-box').id;
}

// Delete the feedback and its associated notification from the server
async function deleteFeedback() {
    const modal = document.getElementById('deleteConfirmationModal');
    const feedbackId = modal.dataset.feedbackId;
    closeModal();
    const feedbackBox = document.getElementById(feedbackId);
    const token = localStorage.getItem('token');

    try {
        // Delete notification associated with the feedback
        const notificationResponse = await fetch(`/notification/${feedbackId.split('-')[1]}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        // Delete feedback from the server
        const response = await fetch(`/feedbacks/${feedbackId.split('-')[1]}`, {  
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok && notificationResponse.ok) {
            feedbackBox.parentNode.removeChild(feedbackBox);
            await updateNotificationCount(); // Update the notification count after deletion
        } else {
            console.error('Failed to delete feedback:', response.statusText);
        }
    } catch (error) {
        console.error('Error deleting feedback:', error);
    }
}

// Close the modal for delete or respond actions
function closeModal() {
    const deleteModal = document.getElementById('deleteConfirmationModal');
    const respondModal = document.getElementById('respondConfirmationModal');
    
    if (deleteModal.style.display === 'block') {
        deleteModal.style.display = 'none';
    }
    
    if (respondModal.style.display === 'block') {
        respondModal.style.display = 'none';
    }
}

// Display respond confirmation modal and store the feedback details to be responded to
function confirmRespond(button) {
    const feedbackBox = button.closest('.feedback-box');
    const feedbackDetails = {
        Fid: feedbackBox.id.split('-')[1], // Extract the actual Fid here
        title: feedbackBox.querySelector('h1').innerText.replace('Title: ', ''),
        username: feedbackBox.querySelector('h2').innerText.replace('Username: ', ''),
        email: feedbackBox.querySelector('h3').innerText.replace('Email: ', ''),
        feedback: feedbackBox.querySelector('p').innerText,
        date: feedbackBox.querySelector('h4').innerText
    };

    localStorage.setItem('selectedFeedback', JSON.stringify(feedbackDetails));

    const modal = document.getElementById('respondConfirmationModal');
    modal.style.display = 'block';
    modal.dataset.feedbackId = feedbackBox.id;
}

// Navigate to the respond page after confirming the respond action
function respondFeedback() {
    closeModal();
    window.location.href = 'FeedbackResponse.html';
}
