document.addEventListener('DOMContentLoaded', (event) => {
    const signupButton = document.getElementById('signupButton');
    if(signupButton) {
        signupButton.addEventListener('click', () => {
            window.location.href = "html/SignUpPage.html";
        });
    }

    const loginButton = document.getElementById('loginButton');
    if(loginButton) {
        loginButton.addEventListener('click', () => {
            window.location.href = "html/loginPage.html";
        });
    }
});

document.addEventListener('DOMContentLoaded', (event) => {
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(signupForm);
            const dataReceived = {};
            formData.forEach((value, key) => {
                dataReceived[key] = value;
            });

            try {
                const response = await fetch('http://localhost:3000/users/register', {
                    method: 'POST', 
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dataReceived)
                });

                const result = await response.json();
                console.log("Signup successful!");

                if (response.status == 201) {
                    alert("Signup Successful!");
                    window.location.href = "html/loginPage.html";
                } else {
                    alert("Signup Failed: ", result.message);
                }
                
            } catch (error) {
                console.error("Error signing up: ", error);
                alert("An error occurred. Please try again.");
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(loginForm);
            const dataReceived = {};
            formData.forEach((value, key) => {
                dataReceived[key] = value;
            });

            try {
                const response = await fetch('http://localhost:3000/users/login', {
                    method: 'POST', 
                    headers: {
                        'Content-Type': 'application/json'
                    }, 
                    body: JSON.stringify(dataReceived)
                });

                const result = await response.json();
                console.log("Login Response: ", result);

                if (response.status == 201) {
                    alert("Login Successful!");
                    window.location.href = "html/home.html";
                } else {
                    alert("Login Failed: ", result.message);
                }
            } catch (error) {
                console.error("Error logging up: ", error);
                alert("An error occurred. Please try again");
            }
        });
    }

});