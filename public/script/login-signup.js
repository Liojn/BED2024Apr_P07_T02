document.addEventListener('DOMContentLoaded', (event) => {
    const signupButton = document.getElementById('signupButton');
    if(signupButton) {
        signupButton.addEventListener('click', () => {
            window.location.href = "html/SignUpPage.html"; // Redirecting to signup page
        });
    }

    const loginButton = document.getElementById('loginButton');
    if(loginButton) {
        loginButton.addEventListener('click', () => {
            window.location.href = "html/loginPage.html"; // Redirecting to login page
        });
    }
});

// Function executed when DOM content is loaded
document.addEventListener('DOMContentLoaded', (event) => {
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');

    // Handling signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Preventing default form submission
            const formData = new FormData(signupForm); // Getting form data
            const dataReceived = {};
            formData.forEach((value, key) => {
                dataReceived[key] = value; // Parsing form data into an object
            });
            // console.log(dataReceived);

            try {
                // Sending form data to server for user registration
                const response = await fetch('http://localhost:3000/users/register', {
                    method: 'POST', 
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dataReceived) // Converting data to JSON string
                });

                const result = await response.json(); // Parsing server response
                console.log(result);
                
                if (response.status == 201) {
                    alert("Signup Successful! ", result.message);
                    window.location.href = "#";
                } else {
                    alert("Signup Failed: ", result.message);
                }
                
            } catch (error) { // Exception handlings
                console.error("Error signing up: ", error);
                alert("An error occurred. Please try again.");
            }
        });
    }

    // Handling login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(loginForm); // Getting form data
            const dataReceived = {};
            formData.forEach((value, key) => {
                dataReceived[key] = value; // Parsing form data into an object
            });
    
            try {
                // Sending form data to server for user login
                const response = await fetch('http://localhost:3000/users/login', {
                    method: 'POST', 
                    headers: {
                        'Content-Type': 'application/json'
                    }, 
                    body: JSON.stringify(dataReceived)
                });
    
                const result = await response.json(); // Parsing server response
                
                if (response.status == 200) { // Checking for 200 status
                    alert("Login Successful! " + result.message);
                    window.location.href = "../html/Homepage.html";
                } else {
                    alert("Login Failed: " + result.message);
                }
            } catch (error) { // Exception handling
                console.error("Error logging in: ", error);
                alert("An error occurred. Please try again.");
            }
        });
    }
});