// Retrieve data from LocalStorage 
const token = localStorage.getItem('token');
const accountType = localStorage.getItem('accountType');

// Function to fetch users from the server
const fetchUsers = async () => {
    try {
        const response = await fetch('http://localhost:3000/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // Include authorization token in the headers
            }
        });
        if (response.ok) {
            const users = await response.json(); // Parse response as JSON
            displayUsers(users); // Call the displayUsers function with the fetched users
        } else {
            console.error('Failed to fetch users'); // Error handling for request fails
        }
    } catch (error) {
        console.error('Error:', error); // Error handling to fetch operation
    }
};

// Event listener for when the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const usersTable = document.getElementById('usersTable').getElementsByTagName('tbody')[0];
    const backToProfileBtn = document.getElementById('backToProfileBtn');

    fetchUsers(); // Fetch the users when the page loads
    
    // Event listener for the back to profile button
    backToProfileBtn.addEventListener('click', function() {
        window.location.href = '../html/profilePage.html'
    });
});

// Function to display users in the table
function displayUsers(users) {
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = '';

    users.forEach(user => {
        const row = tbody.insertRow(); // Insert a new row in the tbody
        // Inserting cells
        row.insertCell(0).textContent = user.username;
        row.insertCell(1).textContent = user.email;
        row.insertCell(2).textContent = user.accountType;

        const actionCell = row.insertCell(3); // Insert a cell for action button for deleting users
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteUser(user.userId); // Call deleteUser function
        actionCell.appendChild(deleteButton);
    });

    document.getElementById('usersTable').style.display = 'table'; // Ensure the table is displayed
}


async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) { // Confirm delete
        return;
    }

    // Fetch all users 
    try {
        const response = await fetch(`http://localhost:3000/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete user');
        }

        alert('User deleted successfully'); // Alert the user that the deletion was successful
        fetchUsers(); // Refresh the user list
    } catch (error) { // Error handlings
        console.error('Error:', error);
        alert('Error deleting user: ' + error.message);
    }
}