document.addEventListener('DOMContentLoaded', () => {
    const editProfileForm = document.getElementById('editProfileForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const password = document.getElementById('password');
    const cancelBtn = document.getElementById('cancelBtn');
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    // Fetch user data and populate the form
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

                usernameInput.value = userData.username; // Populate username field
                emailInput.value = userData.email; // Populate email field
            } else {
                console.error('Failed to fetch user data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    fetchUserData(); // Call fetch user data

    // Handle form submission for updating user profile
    editProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const dataReceived = {}
        formData.forEach((value, key) => {
            dataReceived[key] = value;
        });
        // console.log("Data to send: ", dataReceived);

        // Checks for updates
        if (Object.keys(dataReceived).length === 0) {
            alert('No changes to update');
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:3000/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataReceived)
            });

            if (response.ok) {
                const result = await response.json();
                // console.log("Update successful: ", result);
                
                // Update form fields with updated data
                if (result.user) {
                    usernameInput.textContent = result.user.username;
                    emailInput.textContent = result.user.email;
                }
                
                alert('Profile updated successfully', result);
                window.location.href = '../html/profilePage.html';
            } else { 
                console.error("Update failed: ", await response.text());
                alert('Failed to update profile');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while updating the profile');
        }
    });

    // Handle cancel button click to redirect to profile page
    cancelBtn.addEventListener('click', () => {
        alert("redirecting..");
        window.location.href = "../html/profilePage.html";
    });







    
    /*
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
        */
});