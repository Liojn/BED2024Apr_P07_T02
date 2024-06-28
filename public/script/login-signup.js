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

