document.addEventListener('DOMContentLoaded', () => {
    fetchFeedbacks('N');

    
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    }

    const accountType = localStorage.getItem('accountType');
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username'); // Retrieve username from local storage
    const email = localStorage.getItem('email'); // Retrieve email from local storage

    console.log(accountType);
    const staffButton = document.getElementById('staffButton');
    
    if (accountType === 'Staff' && staffButton) {
        staffButton.style.display = 'block';
        staffButton.addEventListener('click', () => {
            window.location.href = 'FeedbackStaff.html'; 
        });
    }

    const feedbackForm = document.querySelector('.contact-left');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(feedbackForm);
            const feedbackData = {
                username: username, 
                email: email, 
                title: formData.get('feedbackTitle'),
                feedback: formData.get('feedback'),
                verified: "N",
                date: formatDate(new Date())
            };

            try {
                const response = await fetch('/feedbacks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // Include token in request headers
                    },
                    body: JSON.stringify(feedbackData),
                });

                if (response.ok) {
                    alert('Feedback submitted successfully!');
                    feedbackForm.reset();
                    fetchFeedbacks(); // Update feedback list
                } else {
                    console.error('Failed to submit feedback:', response.statusText);
                }
            } catch (error) {
                console.error('Error submitting feedback:', error);
            }
        });
    }
});

async function fetchFeedbacks(filter = 'all') {
    try {
        const token = localStorage.getItem('token');
        let url;
        
        if (filter === 'all') {
            url = "/feedbacks";
        } else {
            url = `/feedbacks/verified/${filter}`;
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}` // Include token in request headers
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const feedbacks = await response.json();

        console.log('Fetched feedbacks:', feedbacks); // Log the fetched feedbacks

        // Check if the response is an array
        if (!Array.isArray(feedbacks)) {
            throw new Error('Response is not an array');
        }

        const feedbackContainer = document.getElementById('feedbackContainer');
        feedbackContainer.innerHTML = ''; // Clear existing feedbacks

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


function filterFeedbacks() {
    const filterValue = document.getElementById('filterDropdown').value;
    fetchFeedbacks(filterValue);
}

function confirmDelete(button) {
    const modal = document.getElementById('deleteConfirmationModal');
    modal.style.display = 'block';
    modal.dataset.feedbackId = button.closest('.feedback-box').id;
}

async function deleteFeedback() {
    const modal = document.getElementById('deleteConfirmationModal');
    const feedbackId = modal.dataset.feedbackId;
    closeModal();
    const feedbackBox = document.getElementById(feedbackId);
    const token = localStorage.getItem('token');

    try {
        const notificationResponse = await fetch(`/notification/${feedbackId.split('-')[1]}`,{
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            } 
        }
    )

        const response = await fetch(`/feedbacks/${feedbackId.split('-')[1]}`, {  
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Include token in request headers
            }
        });

        if (response.ok && notificationResponse.ok) {
            feedbackBox.parentNode.removeChild(feedbackBox);
        } else {
            console.error('Failed to delete feedback:', response.statusText);
        }
    } catch (error) {
        console.error('Error deleting feedback:', error);
    }
}


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

function confirmRespond(button) {
    const feedbackBox = button.closest('.feedback-box');
    const feedbackDetails = {
        Fid: feedbackBox.id.split('-')[1], // Extract the actual Fid here
        title: feedbackBox.querySelector('h1').innerText.replace('Title: ', ''),
        username: feedbackBox.querySelector('h2').innerText.replace('Username: ', ''),
        email: feedbackBox.querySelector('h3').innerText.replace('Email: ', ''),
        feedback: feedbackBox.querySelector('p').innerText
    };

    localStorage.setItem('selectedFeedback', JSON.stringify(feedbackDetails));

    const modal = document.getElementById('respondConfirmationModal');
    modal.style.display = 'block';
    modal.dataset.feedbackId = feedbackBox.id;
}


function respondFeedback() {
    const modal = document.getElementById('respondConfirmationModal');
    const feedbackId = modal.dataset.feedbackId;
    closeModal();
    window.location.href = 'FeedbackResponse.html';
}




