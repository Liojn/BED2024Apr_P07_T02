
let isFormDirty = false; //default false as form not edited yet

//DATE FORMATTING FOR PRINTING, default UTC, as already in SGT stored in MSSQL. 
const options = {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    timeZone: 'UTC'
};
const dateOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
};
const timeOptions = {
    hour: 'numeric',
    minute: 'numeric',
    timeZone: 'UTC'
};
const formatter = new Intl.DateTimeFormat('en-GB', options); //en-GB for the proper format
const dateFormatter = new Intl.DateTimeFormat('en-GB', dateOptions);
const timeFormatter = new Intl.DateTimeFormat('en-GB', timeOptions);


//IMPORTANT, for authentication throughout the website
const token = localStorage.getItem("token") || ''; //set as empty if needed, which will assist in prompting session expired

console.log(token);

//Function to confirm request when user clicks for register button
const registerEventConfirm = (event) => {
    const eventId = event.target.getAttribute('data-event-id');
    event.preventDefault();

    const response = confirm(`Are you sure you want to sign up for this event ID ${eventId}? Action is irreversible, make sure you checked the dates.`);
    if (response) {
        registerEvent(eventId);
    }
}

const pdfPrint = async (event) => {
    try {
        const eventId = event.target.getAttribute('data-event-id') || event.target.parentElement.getAttribute('data-event-id');
        console.log(eventId);
        const response = await fetch(`/events/download/${eventId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/pdf'
            }
        });
    
        // Check if the response is ok
        if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `event_id${eventId}_summary.pdf`;
            document.body.appendChild(a); //Append anchor to body
            a.click(); //Trigger download
            document.body.removeChild(a); // Remove anchor from body
            URL.revokeObjectURL(url); //Clean up
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.log(error);
        if (error.message.includes('Unauthorized')){
            alert('You are not authorized to access, please log in if you have a valid account.');
            localStorage.removeItem('token'); //Clear token
            window.location.href = '../Index.html'; //Redirect to login page
        } else if (error.message.includes('Token has expired')) {
            alert('Session expired. Please log in again.');
            localStorage.removeItem('token'); // Clear the token
            window.location.href = '../Index.html'; //Redirect to login page
        } else if (error.message.includes('Invalid token')) {
            alert('Invalid token. Please log in again.');
            localStorage.removeItem('token'); // Clear the token
            window.location.href = '../Index.html'; //Redirect to login page
        } else if (error.message.includes('Forbidden')) { //Incorrect role
            alert('You do not have permission to access this resource.');
        } else {
            alert(`Failed to fetch PDF: ${error.message}`);
        }
    }

}

const registerEvent = async (eventId) => {
    try{
        const response = await fetch(`/events/register/${eventId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const resJson = await response.json();
            throw new Error(resJson.error || 'Registration failed');
        }
        const resJson = await response.json();
        const registrationTime = new Date(resJson.registrationTime);
        alert(`Registration successful!\nRegistration ID: ${resJson.registrationId}\nEvent ID: ${resJson.eventId}\nRegistration Time: ${formatter.format(registrationTime)}`);
    
    } catch (error){
        console.log('An error occurred:', error.message);
        if (error.message.includes('Unauthorized')){
            alert('You are not authorized to access, please log in if you have a valid account.');
            localStorage.removeItem('token'); //Clear token
            window.location.href = '../Index.html'; //Redirect to login page
        } else if (error.message.includes('Token has expired')) {
            alert('Session expired. Please log in again.');
            localStorage.removeItem('token'); // Clear the token
            window.location.href = '../Index.html'; // Redirect to login page
        } else if (error.message.includes('Invalid token')) {
            alert('Invalid token. Please log in again.');
            localStorage.removeItem('token'); // Clear the token
            window.location.href = '../Index.html'; // Redirect to login page
        } else if (error.message.includes('Forbidden')) {
            alert('You do not have permission to access this resource.');
        } else if (error.message === 'Registration failed') {
            alert('Registration failed. Please try again later.');
        } else {
            alert(`Error: ${error.message}`);
        }
    }
};

//A function that executes when the button Create new Post is clicked on event.html
const navigatetoEventForm = (isEdit) => {
    if (isEdit) {
        sessionStorage.setItem('mode', 'create'); //Indicator for which text to display, This function only activates for creation.
    } 
    window.location.href = "../html/event-creation.html";
}

const navigateToList = (event) => {
    event.preventDefault();
    const eventId = event.target.getAttribute('data-event-id');
    sessionStorage.setItem('eventId', eventId);  // Save event ID for PUT request and displaying 

    window.location.href = "../html/eventParticipantsList.html";
}

//The endpoint which will be call first when view participant page, or more information
const displayEventOnList = async (eventId) => {
    try {
        const response = await fetch(`/events/${eventId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        //proceed as plan
        const jsonData = await response.json();
        console.log(jsonData);

        // Formatting of data for display
        document.getElementById('pTitle').textContent = jsonData.title;
        const startDate = new Date(jsonData.date);
        const startTime = new Date(jsonData.startTime);
        const endTime = new Date(jsonData.endTime);

        const formattedDate = dateFormatter.format(startDate);
        const formattedStartTime = timeFormatter.format(startTime);
        const formattedEndTime = timeFormatter.format(endTime);
        
        // Combine formatted date and time
        const formattedDateTime = `${formattedDate} at ${formattedStartTime} - ${formattedEndTime}`;
        
        document.getElementById('p-datetime').innerHTML = '<p>' + formattedDateTime + '</p>';
        document.getElementById('p-location').innerHTML = '<p>' + jsonData.location + '</p>';

        // Update the data-event-id attribute of the download button
        const downloadButton = document.querySelector('.download-pdf-button');
        downloadButton.setAttribute('data-event-id', jsonData.eventId);

        const location = jsonData.location;
        displayParticipants(eventId);
        embedMapAPI(location);
    } catch (error) {
        console.log('An error occurred:', error.message);

        if (error.message.includes('Unauthorized')){
            alert('You are not authorized to access, please log in if you have a valid account.');
            localStorage.removeItem('token'); //Clear token
            window.location.href = '../Index.html'; //Redirect to login page
        } else if (error.message.includes('Token has expired')) {
            alert('Session expired. Please log in again.');
            localStorage.removeItem('token'); // Clear the token
            window.location.href = '../Index.html'; // Redirect to login page
        } else if (error.message.includes('Invalid token')) {
            alert('Invalid token. Please log in again.');
            localStorage.removeItem('token'); // Clear the token
            window.location.href = '../Index.html'; // Redirect to login page
        } else if (error.message.includes('Forbidden')) {
            alert('You do not have permission to access this resource.');
            window.location.href = '../html/homePage.html'; //Redirect to home page
        } else {
            alert(`Error: ${error.message}`);
            window.location.href = '../html/homePage.html'; //Redirect to home page
        }
    }
}

const displayParticipants = async(eventId) => {
    const response = await fetch(`/events/find-participants/${eventId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    // Clear existing participant list if needed
    const participantList = document.querySelector('.participant-list');
    participantList.innerHTML = '';

    if (response.status === 404) {
        console.log('No registrations found for the event');
        const participantList = document.querySelector('.participant-list');
        participantList.innerHTML = '<p>No registrations found for this event.</p>';
        return;
    }

    if (response.ok) {
        const participantsData = await response.json();
        console.log(participantsData);

        //Loop through participantsData and create participant-cards
        participantsData.forEach(participant => {
            const participantCard = document.createElement('div');
            participantCard.classList.add('participant-card');

            const participantInfo = document.createElement('div');
            participantInfo.classList.add('participant-info');

            const participantName = document.createElement('div');
            participantName.classList.add('participant-name');
            participantName.innerHTML = `<span style="font-weight: 700;">Username:</span><br>${participant.username}`;

            const registrationDate = new Date(participant.registrationTime);
            const formattedDate = formatter.format(registrationDate);
            const participantTime = document.createElement('div');
            participantTime.classList.add('participant-time');
            participantTime.innerHTML = `<span style="font-weight: 700;">Registered Date:</span><br>${formattedDate}`;

            participantInfo.appendChild(participantName);
            participantInfo.appendChild(participantTime);

            participantCard.appendChild(participantInfo);
            participantList.appendChild(participantCard);
        });
    } else {
        console.error('Failed to fetch participants list;');
        alert('Failed to fetch participants list');
    }
}

//Function which get the google api embed link
const embedMapAPI = async(location) => {
    try{
        const response = await fetch(`/events/get-location?location=${encodeURIComponent(location)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'text-plain'
            }
        });
        const data = await response.json();

        if (data.status === 'success' || data.status === 'search') {
            document.getElementById('mapFrame').src = data.mapUrl;
        
        } else {
            alert('Could not load the map for requested location. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while loading the map.');
    }

} 

//Function to carry out Search Events and display
const submitSearchReq = async() => {
    let query = document.getElementById('search-content').value;

    if (!query) {
        alert('Submission is blank. Try again later.')
    }
    try{
        const response = await fetch(`/events/search?searchTerm=${query}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const eventData = await response.json();

        if (eventData.length == 0){ //if there is none found, stop the function
            alert('Results found: 0 matches');
            return;
        }
        const eventIndicator = document.getElementsByClassName("event-content")[0]; 
        eventIndicator.innerHTML = ''; //Clears the existing posts
        console.log(eventData); // testing in browser console

        //sort eventData by eventId in descending order
        eventData.sort((a, b) => b.eventId - a.eventId);

        eventData.forEach(element => {
            const eventBox = document.createElement('div');
            eventBox.id = "content";
            eventBox.setAttribute('data-event-id', element.eventId); //Set data-event-id attribute for reference if needed, This is for Edit and Delete, to get their id number
            const getRole = localStorage.getItem('accountType');
            const getUsername = localStorage.getItem('username');

            //Checking if is admin, can view Edit and Delete Option, OR is the student post
            if (getRole == 'Staff' || getUsername == element.username){
                eventBox.innerHTML = `
                <div class="left">
                    <div id="username">User: ${element.username}</div>
                    <div id="title">${element.title}</div>
                    <div id="date">${formatted_date(element.date)}</div>
                    <div id="location">${element.location}</div>
                    <div id="info">
                        <p style="font-weight: 600;">Time: <span>${element.startTime.slice(11, 16)} to ${element.endTime.slice(11, 16)}</span></p>
                        <p>${element.description}</p>
                    </div>
                </div>
                <div class="right">
                    <div class="optionbar">
                        <a onclick="navigateToEdit(event, false)" href="#" data-event-id="${element.eventId}">Edit</a> <!---This is for Edit and Delete, to get their id number through storing attributes---->
                        <a onclick="deleteEventConfirm(event, false)" href="#" data-event-id="${element.eventId}">Delete</a>
                    </div>
                    <div class="actions">
                        <button onclick="registerEventConfirm(event)" id="register" data-event-id="${element.eventId}">Register Interest</button>
                        <button onclick="navigateToList(event)" id="pList" data-event-id="${element.eventId}">View Participant List</button>
                    </div>
                    <div id="post-id">id_: ${element.eventId}</div>
                </div>
            `;
            } else{
                eventBox.innerHTML = `
                <div class="left">
                    <div id="username">User: ${element.username}</div>
                    <div id="title">${element.title}</div>
                    <div id="date">${formatted_date(element.date)}</div>
                    <div id="location">${element.location}</div>
                    <div id="info">
                        <p style="font-weight: 600;">Time: <span>${element.startTime.slice(11, 16)} to ${element.endTime.slice(11, 16)}</span></p>
                        <p>${element.description}</p>
                    </div>
                </div>
                <div class="right">
                    <div class="optionbar">
                        <!-----NO OPTION---->
                    </div>
                    <div class="actions">
                        <button onclick="registerEventConfirm(event)" id="register" data-event-id="${element.eventId}">Register Interest</button>
                        <button onclick="navigateToList(event)" id="pList" data-event-id="${element.eventId}">View Participant List</button>
                    </div>
                    <div id="post-id">id_: ${element.eventId}</div>
                </div>
            `;
            }
            eventIndicator.appendChild(eventBox);
        });
        alert(`Search successful: ${eventData.length} relevant result found.`);

    }  catch (error){
        if (error.message.includes('Unauthorized')){
            alert('You are not authorized to access, please log in if you have a valid account.');
            localStorage.removeItem('token'); //Clear token
            window.location.href = '../Index.html'; //Redirect to login page
        } else if (error.message.includes('Token has expired')) {
            alert('Session expired. Please log in again.');
            localStorage.removeItem('token'); //Clear token
            window.location.href = '../Index.html'; //Redirect to login page
        } else if (error.message.includes('Invalid token')) {
            alert('Invalid token. Please log in again.');
            localStorage.removeItem('token'); 
            window.location.href = '../Index.html';
        } else if (error.message.includes('Forbidden')) {
            alert('You do not have permission to access this resource.');
            window.location.href = '../html/homePage.html'; //Redirect to home page
        } else {
            alert(`Could not find Event. Error message: ${error}`);
        }
    };
};

//GET function for ALL events in the event.html, endpoint that calls for my MAIN event page
async function getAllEvents(eventIndicator) {
    try {
        const response = await fetch("/events", {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const eventData = await response.json();
        console.log(eventData); // testing in browser console

        //sort eventData by eventId in descending order
        eventData.sort((a, b) => b.eventId - a.eventId);

        eventData.forEach(element => {
            const eventBox = document.createElement('div');
            eventBox.id = "content";
            eventBox.setAttribute('data-event-id', element.eventId); //Set data-event-id attribute for reference if needed, This is for Edit and Delete, to get their id number
            const getRole = localStorage.getItem('accountType'); //Set from login, use it here
            const getUsername = localStorage.getItem('username');

            //Checking if is admin, can view Edit and Delete Option, OR is the student post
            if (getRole == 'Staff' || getUsername == element.username){
                eventBox.innerHTML = `
                <div class="left">
                    <div id="username">User: ${element.username}</div>
                    <div id="title">${element.title}</div>
                    <div id="date">${formatted_date(element.date)}</div>
                    <div id="location">${element.location}</div>
                    <div id="info">
                        <p style="font-weight: 600;">Time: <span>${element.startTime.slice(11, 16)} to ${element.endTime.slice(11, 16)}</span></p>
                        <p>${element.description}</p>
                    </div>
                </div>
                <div class="right">
                    <div class="optionbar">
                        <a onclick="navigateToEdit(event, false)" href="#" data-event-id="${element.eventId}">Edit</a> <!---This is for Edit and Delete, to get their id number through storing attributes---->
                        <a onclick="deleteEventConfirm(event, false)" href="#" data-event-id="${element.eventId}">Delete</a>
                    </div>
                    <div class="actions">
                        <button onclick="registerEventConfirm(event)" id="register" data-event-id="${element.eventId}">Register Interest</button>
                        <button onclick="navigateToList(event)" id="pList" data-event-id="${element.eventId}">View Participant List</button>
                    </div>
                    <div id="post-id">id_: ${element.eventId}</div>
                </div>
            `;
            } else{
                eventBox.innerHTML = `
                <div class="left">
                    <div id="username">User: ${element.username}</div>
                    <div id="title">${element.title}</div>
                    <div id="date">${formatted_date(element.date)}</div>
                    <div id="location">${element.location}</div>
                    <div id="info">
                        <p style="font-weight: 600;">Time: <span>${element.startTime.slice(11, 16)} to ${element.endTime.slice(11, 16)}</span></p>
                        <p>${element.description}</p>
                    </div>
                </div>
                <div class="right">
                    <div class="optionbar">
                        <!-----NO OPTION---->
                    </div>
                    <div class="actions">
                        <button onclick="registerEventConfirm(event)" id="register" data-event-id="${element.eventId}">Register Interest</button>
                        <button onclick="navigateToList(event)" id="pList" data-event-id="${element.eventId}">View Participant List</button>
                    </div>
                    <div id="post-id">id_: ${element.eventId}</div>
                </div>
            `;
            }
            eventIndicator[0].appendChild(eventBox);
        });

    } catch (error) { //error handling
        console.log(error);
        if (error.message.includes('Unauthorized')){
            alert('You are not authorized to access, please log in if you have a valid account.');
            localStorage.removeItem('token'); //Clear token
            window.location.href = '../Index.html'; //Redirect to login page
        } else if (error.message.includes('Token has expired')) {
            alert('Session expired. Please log in again.');
            localStorage.removeItem('token'); //Clear token
            window.location.href = '../Index.html'; //Redirect to login page
        } else if (error.message.includes('Invalid token')) {
            alert('Invalid token. Please log in again.');
            localStorage.removeItem('token'); 
            window.location.href = '../Index.html';
        } else if (error.message.includes('Forbidden')) {
            alert('You do not have permission to access this resource.');
        } else {
            alert(`An error occurred: ${error.message}`);
        }
    }
}

//A function that executes when the <a> tag Edit is clicked on event.html
const navigateToEdit = (event) => {
    const eventId = event.target.getAttribute('data-event-id');
    event.preventDefault();

    console.log(eventId);
    sessionStorage.setItem('mode', 'edit'); //To display the text edit, indicator
    sessionStorage.setItem('eventId', eventId);  // Save event ID for PUT request and displaying 
    window.location.href = "../html/event-creation.html";
}

//Function for confirming deletion of the user post first
const deleteEventConfirm = (event) => {
    const eventId = event.target.getAttribute('data-event-id');
    event.preventDefault();

    const confirmation = confirm(`Are you sure you want to delete this event with the ID: ${eventId}? Action is irreversible.`);
    if (confirmation){
        deleteEvent(eventId);
    }
}

const deleteEvent = async(eventId) => {
    try {
        const response = await fetch(`/events/${eventId}/deletion`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Network response was not ok');
        }
        window.alert("Event deleted successfully!");
        window.location.href = "../html/event.html";
    } catch (error) {
        console.error('Error:', error);
        if (error.message.includes('Unauthorized')){
            alert('You are not authorized to access, please log in if you have a valid account.');
            localStorage.removeItem('token'); //Clear token
            window.location.href = '../Index.html'; //Redirect to login page
        } else if (error.message.includes('Token has expired')) {
            alert('Session expired. Please log in again.');
            localStorage.removeItem('token'); //Clear token
            window.location.href = '../Index.html'; //Redirect to login page
        } else if (error.message.includes('Invalid token')) {
            alert('Invalid token. Please log in again.');
            localStorage.removeItem('token'); 
            window.location.href = '../Index.html';
        } else if (error.message.includes('Forbidden')) {
            alert('You do not have permission to access this resource.');
        } else {
            alert(`Error deleting event: ${error.message}`);
        }
    }
}

//Function for retrieving specific Event Post based on ID, used for editing 
const getExistingInfo = async(eventId) => {
    try {
        const response = await fetch(`/events/${eventId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const eventData = await response.json();
        console.log(eventData);

        //Formatting of data for display
        document.getElementById('title').value = eventData.title;
        document.getElementById('date').value = eventData.date.split('T')[0]; //"2024-09-14T00:00:00.000Z" Example
        document.getElementById('start-time').value = eventData.startTime.split('T')[1].substring(0, 5);  //"1900-01-01T18:00:00.000Z" Example
        document.getElementById('end-time').value = eventData.endTime.split('T')[1].substring(0, 5);
        document.getElementById('location').value = eventData.location;
        document.getElementById('description').value = eventData.description;
    } catch (error) {
        console.error('An error occurred:', error.message);
        if (error.message.includes('Unauthorized')){
            alert('You are not authorized to access, please log in if you have a valid account.');
            localStorage.removeItem('token'); //Clear token
            window.location.href = '../Index.html'; //Redirect to login page
        } else if (error.message.includes('Token has expired')) {
            alert('Session expired. Please log in again.');
            localStorage.removeItem('token'); //Clear token
            window.location.href = '../Index.html'; //Redirect to login page
        } else if (error.message.includes('Invalid token')) {
            alert('Invalid token. Please log in again.');
            localStorage.removeItem('token'); 
            window.location.href = '../Index.html';
        } else if (error.message.includes('Forbidden')) {
            alert('You do not have permission to access this resource.');
            window.location.href = '../html/homePage.html'; //Redirect to home page
        } else {
            alert('Failed to fetch event info. Please try again later.');
        }
    }
}


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
        } else if (error.message.includes('Forbidden')) {
            alert('You do not have permission to access this resource.');
            window.location.href = '../html/homePage.html'; // Redirect to home page
        } else {
            alert(`An error occurred: ${error.message} `);
        }
    }
}

//Indicator to check wheteher to execute getAllEvents, if at the correct site using the .class tag
document.addEventListener("DOMContentLoaded", function () {
    updateNotificationCount();
    const eventIndicator = document.getElementsByClassName("event-content"); //check if at the corresponding page
    if (eventIndicator.length > 0) {
        getAllEvents(eventIndicator);
    }

    //This session of code will check if it needs to display edit or create, when loading a page. Must be at event-creation.html
    const mode = sessionStorage.getItem('mode');
    const isCorrectPage = document.getElementById("header-title");
    if (mode === 'edit' && isCorrectPage != null) {
        const eventId = sessionStorage.getItem('eventId');
        if (eventId) {
            document.getElementById('header-title').textContent = `Edit Current Post: ID ${eventId}`;
            getExistingInfo(eventId); // Fetch existing event info if editing    
        }
    } 
    else if (mode === 'create' && isCorrectPage != null) {
        document.getElementById('header-title').textContent = "Create New Post";
    }

    //Indicator checking of Participants Page
    const pIndicator = document.getElementsByClassName("participantPgContainer");
    if (pIndicator.length > 0){
        const eventId = sessionStorage.getItem('eventId');
        displayEventOnList(eventId);
    }
});

//define the formatted_date function to reflect the date nicely for EVENTS POST 
function formatted_date(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

//function for exit button when Creating or Editing the form
const exitEventForm = () =>{
    if (isFormDirty){
        const response = confirm("We detected you have unpublished changes. Continue to exit?");
        if (response){
            window.location.href = "../html/event.html"
        }
    }
    else{
        window.location.href = "../html/event.html"
    }
}

//This checks if the input has been modified before, if yes then it sets isFormDirty to true.
document.querySelectorAll('#eventForm input, #eventForm textarea').forEach(element => {
    element.addEventListener('input', () => {
        isFormDirty = true;
    });
});

//This function handles the PUT or POST method
document.getElementById('eventForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent default form submission
    const mode = sessionStorage.getItem('mode');

    let title = document.getElementById('title').value;
    let date = document.getElementById('date').value;
    let startTime = document.getElementById('start-time').value;
    let endTime = document.getElementById('end-time').value;
    let location = document.getElementById('location').value;
    let description = document.getElementById('description').value;
    //let username = localStorage.getItem('username'); handled by token

    const jsonData ={
        "title": title,
        "date": date,
        "startTime": startTime,
        "endTime": endTime,
        "location": location,
        "description": description,
    };
    console.log(jsonData); //test

    try {
        let response;
        if (mode === 'edit') {  //PUT command
            const eventId = sessionStorage.getItem('eventId'); //get the eventId when it is set, being clicked edit
            response = await fetch(`/events/${eventId}/update`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jsonData)
            });
        } else if (mode === 'create') {  // POST command
            response = await fetch('/events', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jsonData)
            });
        } else {
            throw new Error('Internal system error.');
        }

        if (!response.ok) { //not 200
            const errorData = await response.json(); //Parse the error response as JSON

            // Handle middleware errors first
            if (response.status === 401) {
                throw new Error('Unauthorized: No token');
            } else if (response.status === 403) {
                throw new Error('Forbidden: Token expired or invalid.');
            }

            //Create detailed error message string based on validateEvent server side
            const errorMessage = errorData.errors
                ? errorData.errors.join('\n') // Join all error messages into a single string
                : `HTTP error ${response.status}: ${errorData.message || 'Unknown error'}`;
            
            throw new Error(errorMessage);        }

        const result = await response.json();
        // Handle successful form submission
        console.log('Success:', result);
        window.alert(mode === 'edit' ? 'Update successful!' : 'Post successful!'); //if is edit, send update successfully
        window.location.href = "../html/event.html";

    } catch (error) {
        // Handle errors

        if (error.message.includes('Unauthorized')){
            alert('You are not authorized to access, please log in if you have a valid account.');
            localStorage.removeItem('token'); //Clear token
            window.location.href = '../Index.html'; //Redirect to login page
        } else if (error.message.includes('Token has expired') || error.message.includes('Forbidden')) {
            alert('Session expired or invalid token. Please log in again.');
            localStorage.removeItem('token'); //Clear token
            window.location.href = '../Index.html'; //Redirect to login page
        } else {
            console.error('Error:', error);
            alert(`Error: ${error.message}`);
        }
    }
});