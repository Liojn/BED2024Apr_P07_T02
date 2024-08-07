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
    const backToProfileBtn = document.getElementById('backToProfileBtn');

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
                // console.log("user data fetched: ", userData);

                // Populate user data into the DOM
                username.textContent = userData.username;
                email.textContent = userData.email;
                accountType.textContent = userData.accountType;
                if (userData.profilePicture) {
                    profilePicture.src = userData.profilePicture;
                }
                // Display admin panel if the user is a staff meember
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

    // Event listener for edit profile button 
    editProfileBtn.addEventListener('click', () => {
        window.location.href = '../html/profileEdit.html';
    });

    // Event listener for logout button
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '../html/loginPage.html';
    });

    //Event listener for delete account button
    deleteAccountBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                const response = await fetch(`http://localhost:3000/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    alert('Account deleted successfully');
                    localStorage.removeItem('token');
                    window.location.href = '../html/loginPage.html';
                } else {
                    alert('Failed to delete account');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while deleting the account');
            }
        }
    });

    // Display admin panel and add event listener if user is staff
    if (localStorage.getItem('accountType') === "Staff") {
        adminPanel.style.display = 'block';
        viewAllUsersBtn.addEventListener('click', () => {
            window.location.href = 'adminUsers.html';
        });
    } else {
        document.getElementById('errorMessage').textContent = 'Access denied. Staff only.';
    }

    // Event listener for back to profile button
    if(backToProfileBtn) {
        document.getElementById('backToProfileBtn').addEventListener('click', function() {
            window.location.href = 'profilePage.html';
        });
    }











    updateNotificationCount();
    async function updateNotificationCount() {  
        const username = localStorage.getItem('username');
        const token = localStorage.getItem('token'); // Retrieve token from local storage
    
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
            } else {
                alert(`An error occurred: ${error.message} `);
            }
        }
    }
    
});
