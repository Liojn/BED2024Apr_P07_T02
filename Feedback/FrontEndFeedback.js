function confirmDelete(button) {
    var modal = document.getElementById('deleteConfirmationModal');
    modal.style.display = 'block';
    modal.dataset.feedbackId = button.closest('.feedback-box').id;
}

function deleteFeedback() {
    var modal = document.getElementById('deleteConfirmationModal');
    var feedbackId = modal.dataset.feedbackId;
    closeModal();
    var feedbackBox = document.getElementById(feedbackId);
    feedbackBox.parentNode.removeChild(feedbackBox);
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


function confirmRespond() {
    if (confirm("Do you really want to respond to this feedback?")) {
        window.location.href = 'FeedbackResponse.html';
    }
}