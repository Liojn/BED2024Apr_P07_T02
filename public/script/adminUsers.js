document.addEventListener('DOMContentLoaded', () => {
    const usersTable = document.getElementById('usersTable').getElementsByTagName('tbody')[0];
    const backToProfileBtn = document.getElementById('backToProfileBtn');

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
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

    const displayUsers = (users) => {
        usersTable.innerHTML = '';
        users.forEach(user => {
            const row = usersTable.insertRow();
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.accountType}</td>
                <td>
                    <button class="deleteBtn" data-userid="${user.userId}">Delete</button>
                </td>
            `;
        });

        // Add event listeners to delete buttons
        document.querySelectorAll('.deleteBtn').forEach(button => {
            button.addEventListener('click', handleDeleteUser);
        });
    };

    const handleDeleteUser = async (event) => {
        const userId = event.target.getAttribute('data-userid');
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                const response = await fetch(`/api/users/${userId}/admin/delete`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    alert('User deleted successfully');
                    fetchUsers(); // Refresh the user list
                } else {
                    console.error('Failed to delete user');
                    alert('Failed to delete user. Please try again.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while deleting the user.');
            }
        }
    };


    backToProfileBtn.addEventListener('click', () => {
        window.location.href = 'profile.html';
    });

    // Initial fetch of users when the page loads
    fetchUsers();
});