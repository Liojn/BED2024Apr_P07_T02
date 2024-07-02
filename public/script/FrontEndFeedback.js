document.addEventListener('DOMContentLoaded', () => {
    fetchFeedbacks();

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    }

    const accountType = localStorage.getItem('accountType');
    const staffButton = document.getElementById('staffButton');
    
    if (accountType === 'Staff' && staffButton) {
        staffButton.style.display = 'block';
    }

    const feedbackForm = document.querySelector('.contact-left');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(feedbackForm);
            const feedbackData = {
                username: formData.get('username'),
                email: formData.get('email'),
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
        const url = filter === 'all' ? "/feedbacks" : `/feedbacks/verified/${filter}`;
        const response = await fetch(url);
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
                    <button class="respond-btn" onclick="confirmRespond()">Respond</button>
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

    try {
        const response = await fetch(`/feedbacks/${feedbackId.split('-')[1]}`, {
            method: 'DELETE',
        });

        if (response.ok) {
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

function confirmRespond() {
    if (confirm("Do you really want to respond to this feedback?")) {
        window.location.href = 'FeedbackResponse.html';
    }
}
