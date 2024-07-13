
let isFormDirty = false; //default false as form not edited yet
//localStorage.setItem('username', 'user2');
//localStorage.setItem('accountType', 'Student')

//A function that executes when the button Create new Post is clicked on event.html
const navigatetoEventForm = (isEdit) => {
    if (isEdit) {
        sessionStorage.setItem('mode', 'create'); //Indicator for which text to display, This function only activates for creation.
    } 
    window.location.href = "../html/event-creation.html";
}

//Function to carry out Search Events and display
const submitSearchReq = async() => {
    let query = document.getElementById('search-content').value;

    if (!query) {
        alert('Submission is blank. Try again later.')
    }
    try{
        const response = await fetch(`/events/search/?searchTerm=${query}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
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
                        <button id="register" data-event-id="${element.eventId}">Register Interest</button>
                        <button id="pList" data-event-id="${element.eventId}">View Participant List</button>
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
                        <button id="register" data-event-id="${element.eventId}">Register Interest</button>
                        <button id="pList" data-event-id="${element.eventId}">View Participant List</button>
                    </div>
                    <div id="post-id">id_: ${element.eventId}</div>
                </div>
            `;
            }
            eventIndicator.appendChild(eventBox);
        });
        alert(`Search successful: ${eventData.length}`);
    }  catch (error){
        alert(`Could not find Event. Error message: ${error}`)
    };
};

//GET function for ALL events in the event.html
async function getAllEvents(eventIndicator) {
    try {
        const response = await fetch("/events");
        const eventData = await response.json();
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
                        <button id="register" data-event-id="${element.eventId}">Register Interest</button>
                        <button id="pList" data-event-id="${element.eventId}">View Participant List</button>
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
                        <button id="register" data-event-id="${element.eventId}">Register Interest</button>
                        <button id="pList" data-event-id="${element.eventId}">View Participant List</button>
                    </div>
                    <div id="post-id">id_: ${element.eventId}</div>
                </div>
            `;
            }
            eventIndicator[0].appendChild(eventBox);
        });

    } catch (error) { //error handling
        console.log(error);
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
    await fetch(`/events/${eventId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        window.alert("Event deleted successfully!");
        window.location.href = "../html/event.html";
    })
    .catch(error => {
        console.error('Error:', error);
        window.alert("Error deleting event. Please try again later.")
    });
}

//Function for retrieving specific Event Post based on ID, used for editing 
const getExistingInfo = async(eventId) => {
    const response = await fetch (`/events/${eventId}`);
    if (response.ok) {
        const eventData = await response.json();
        console.log(eventData);

        //Formatting of data for display
        document.getElementById('title').value = eventData.title;
        document.getElementById('date').value = eventData.date.split('T')[0]; //"2024-09-14T00:00:00.000Z" Example
        document.getElementById('start-time').value = eventData.startTime.split('T')[1].substring(0, 5);  //"1900-01-01T18:00:00.000Z" Example
        document.getElementById('end-time').value = eventData.endTime.split('T')[1].substring(0, 5);
        document.getElementById('location').value = eventData.location;
        document.getElementById('description').value = eventData.description;
    } else {
        console.error('Failed to fetch event info');
        alert('Failed to fetch event info');
    }
}

//Indicator to check wheteher to execute getAllEvents, if at the correct site using the .class tag
document.addEventListener("DOMContentLoaded", function () {
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
    
});

//define the formatted_date function to reflect the date nicely
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
    let username = localStorage.getItem('username');

    const jsonData ={
        "title": title,
        "date": date,
        "startTime": startTime,
        "endTime": endTime,
        "location": location,
        "description": description,
        "username": username,
    };
    console.log(jsonData); //test

    if (mode === 'edit') {  //PUT command 
        const eventId = sessionStorage.getItem('eventId');
        //delete jsonData.username; //not needed, will be the same user 

        await fetch(`/events/${eventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData)
        })
        .then(response => response.json())
        .then(result => {
            // Handle successful form submission
            console.log('Success:', result);
            window.alert("Updated successful!");
            window.location.href = "../html/event.html";
        })
        .catch(error => {
            // Handle errors
            console.error('Error:', error);
        });

    } else if (mode === 'create') {   //POST command 
        await fetch('/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData)
        })
        .then(response => response.json())
        .then(result => {
            //Handle successful form submission
            console.log('Success:', result);
            window.alert("Post successful!");
            window.location.href = "../html/event.html"
        })
        .catch(error => {
            //Handle errors
            console.error('Error:', error);
        });
    } else {
        alert('Error with Internal System.')
    }
});

//Function when user clicks for register button
document.getElementById('register').addEventListener('click', function() {
    var eventId = this.getAttribute('data-event-id');
    
});