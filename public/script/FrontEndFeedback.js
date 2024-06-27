fetchFeedbacks();
function confirmDelete(button) {
    var modal = document.getElementById('deleteConfirmationModal');
    modal.style.display = 'block';
    modal.dataset.feedbackId = button.closest('.feedback-box').id;
}

async function deleteFeedback() {
    var modal = document.getElementById('deleteConfirmationModal');
    var feedbackId = modal.dataset.feedbackId;
    closeModal();
    var feedbackBox = document.getElementById(feedbackId);

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
    var deleteModal = document.getElementById('deleteConfirmationModal');
    var respondModal = document.getElementById('respondConfirmationModal');
    
    if (deleteModal.style.display === 'block') {
        deleteModal.style.display = 'none';
    }
    
    if (respondModal.style.display === 'block') {
        respondModal.style.display = 'none';
    }
}

function confirmDelete(button) {
    var modal = document.getElementById('deleteConfirmationModal');
    modal.style.display = 'block';
    modal.dataset.feedbackId = button.closest('.feedback-box').id;
}

function confirmRespond() {
    if (confirm("Do you really want to respond to this feedback?")) {
        window.location.href = 'FeedbackResponse.html';
    }
}

function confirmDelete(button) {
    var modal = document.getElementById('deleteConfirmationModal');
    modal.style.display = 'block';
    modal.dataset.feedbackId = button.closest('.feedback-box').id;
}


//Adding Data
async function fetchFeedbacks() {
    try {
        const response = await fetch("/feedbacks");
        const feedbacks = await response.json();
        console.log(feedbacks)
        const feedbackContainer = document.getElementById('feedbackContainer');
        
        feedbacks.forEach(feedback => {
            const feedbackBox = document.createElement('div');
            feedbackBox.classList.add('feedback-box');
            feedbackBox.id = `feedback-${feedback.Fid}`; // Set unique id

            feedbackBox.innerHTML = `
                <h1>Title: ${feedback.title}</h1>
                <h2>Name: ${feedback.name}</h2>
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

//Post Method for front end to database

const feedbackForm = document.querySelector('.contact-left');
feedbackForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(feedbackForm);
    const feedbackData = {
        name: formData.get('name'),
        email: formData.get('email'),
        feedbackTitle: formData.get('feedbackTitle'),
        feedback: formData.get('feedback')
    };

    try {
        const response = await fetch('/feedbacks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(feedbackData)
        });

        if (response.ok) {
            console.log('Feedback submitted successfully');
            feedbackForm.reset();
        } else {
            console.error('Failed to submit feedback:', response.statusText);
        }
    } catch (error) {
        console.error('Error submitting feedback:', error);
    }
});