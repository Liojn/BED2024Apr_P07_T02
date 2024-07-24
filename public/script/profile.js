document.addEventListener('DOMContentLoaded', () => {
    const username = document.getElementById('username');
    const email = document.getElementById('email');
    const accountType = document.getElementById('accountType');
    const profilePicture = document.getElementById('profilePicture');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const adminPanel = document.getElementById('adminPanel');
    const viewAllUsersBtn = document.getElementById('viewAllUsersBtn');
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    // Fetch user data from the server
    const fetchUserData = async () => {
        try {
            const response = await fetch(`http://localhost:3000/users/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const userData = await response.json();
                console.log("user data fetched: ", userData);

                username.textContent = userData.username;
                email.textContent = userData.email;
                accountType.textContent = userData.accountType;
                if (userData.profilePicture) {
                    profilePicture.src = userData.profilePicture;
                }
                if (userData.accountType === 'staff') {
                    adminPanel.style.display = 'block';
                }
            } else {
                const errorText = await response.text();
                console.error(`Failed to fetch user data: ${errorText}`);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    fetchUserData();

    editProfileBtn.addEventListener('click', () => {
        window.location.href = 'profileEdit.html';
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'loginPage.html';
    });

    deleteAccountBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                const response = await fetch(`http://localhost:3000/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    alert('Account deleted successfully');
                    localStorage.removeItem('token');
                    window.location.href = 'loginPage.html';
                } else {
                    alert('Failed to delete account');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while deleting the account');
            }
        }
    });

    viewAllUsersBtn.addEventListener('click', () => {
        window.location.href = 'adminUsers.html';
    });
});