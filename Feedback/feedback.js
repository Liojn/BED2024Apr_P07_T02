function confirmDelete(button) {
    var modal = document.getElementById('deleteConfirmationModal');
    modal.style.display = 'block';
    modal.dataset.feedbackId = button.closest('.feedback-box').id;
}

function deleteFeedback() {
    var modal = document.getElementById('deleteConfirmationModal');
    var feedbackId = modal.dataset.feedbackId;
    closeModal();
    // Handle delete action here, e.g., remove the feedback box from DOM
    var feedbackBox = document.getElementById(feedbackId);
    feedbackBox.parentNode.removeChild(feedbackBox);
}

function closeModal() {
    var modal = document.getElementById('deleteConfirmationModal');
    modal.style.display = 'none';
    modal.dataset.feedbackId = '';
}

function confirmRespond() {
    if (confirm("Do you really want to respond to this feedback?")) {
        // Navigate to a new page for responding
        window.location.href = 'respond.html'; // Replace with your response page URL
    }
}