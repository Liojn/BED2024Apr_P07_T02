const token = localStorage.getItem('token');
const accountType = localStorage.getItem('accountType');

const fetchUsers = async () => {
    try {
        const response = await fetch('http://localhost:3000/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const users = await response.json();
            displayUsers(users);
        } else {
            console.error('Failed to fetch users');
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const usersTable = document.getElementById('usersTable').getElementsByTagName('tbody')[0];
    const backToProfileBtn = document.getElementById('backToProfileBtn');

    fetchUsers();
    
    backToProfileBtn.addEventListener('click', function() {
        window.location.href = '../html/profilePage.html'
    });
});


function displayUsers(users) {
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = '';

    users.forEach(user => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = user.username;
        row.insertCell(1).textContent = user.email;
        row.insertCell(2).textContent = user.accountType;

        const actionCell = row.insertCell(3);
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteUser(user.userId);
        actionCell.appendChild(deleteButton);
    });

    document.getElementById('usersTable').style.display = 'table';
}


async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }

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

        alert('User deleted successfully');
        fetchUsers(); // Refresh the user list
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting user: ' + error.message);
    }
}