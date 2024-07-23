
// Retrieve the expiration time from localStorage
const tokens = localStorage.getItem("token");

if (!tokens){
    alert('Please login first.');
    window.location.href = '../Index.html';
}

// Function to set expiration time in localStorage
function setExpirationTime() {
  try {
    const decodedToken = jwt_decode(token);
    const expirationTimeInSeconds = decodedToken.exp; //exp claim is in seconds since epoch
    localStorage.setItem('expiry', expirationTimeInSeconds);
  } catch (e) {
    console.error('Failed to decode JWT:', e);
    alert('Failed to decode JWT:, ', e);
  }
}

//Call function to initialize the expiration time (e.g., on login or token refresh)
setExpirationTime();

// Retrieve the expiration time from localStorage
let expirationTime = parseFloat(localStorage.getItem('expiry'));

// If expirationTime is null or NaN, user is not signed in
if (isNaN(expirationTime)) {
  console.log('User is not signed in or session has expired.');
  window.location.href = '../Index.html';
}

function checkTokenExpiration() {
  const now = Date.now() / 1000;
  const timeLeft = expirationTime - now;

  if (timeLeft <= 0) {
    // Token has expired, clear localStorage, redirect to login or request new token
    localStorage.removeItem('expiry'); // Clear the localStorage item
    console.log('Token expired. Redirecting to login.');
    window.location.href = '../Index.html';
  } else {
    // Log remaining time to the console
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = Math.floor(timeLeft % 60);
    console.log(`Time remaining: ${hours}h ${minutes}m ${seconds}s`);
  }
}

// Check token expiration every 10 seconds
setInterval(checkTokenExpiration, 10000);

// When user logs out or requests a new token, clear the localStorage
function logout() {
  localStorage.removeItem('expiry'); // Clear the localStorage item
  console.log('User logged out.');
  // Perform additional logout actions, if necessary
}
