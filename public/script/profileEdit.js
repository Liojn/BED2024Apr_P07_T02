document.addEventListener('DOMContentLoaded', () => {
    const editProfileForm = document.getElementById('editProfileForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const profilePictureInput = document.getElementById('profilePicture');
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
                console.log("user data fetched: ", userData);

                usernameInput.value = userData.username;
                emailInput.value = userData.email;
            } else {
                console.error('Failed to fetch user data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    fetchUserData();

    editProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('username', usernameInput.value);
        formData.append('email', emailInput.value);
        if (profilePictureInput.files[0]) {
            formData.append('profilePicture', profilePictureInput.files[0]);
        }

        try {
            const response = await fetch(`http://localhost:3000/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                alert('Profile updated successfully', result);
                window.location.href = '../html/profilePage.html';
            } else {
                alert('Failed to update profile');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while updating the profile');
        }
    });

    cancelBtn.addEventListener('click', () => {
        alert("redirecting..");
        window.location.href = "../html/profilePage.html";
    });
});