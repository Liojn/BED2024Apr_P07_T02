
let isFormDirty = false; //default false as form not edited yet
localStorage.setItem('username', 'user2');
localStorage.setItem('role', 'Student')

const navigatetoEventForm = () => {
    window.location.href = "../html/event-creation.html"
}

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
            const getRole = localStorage.getItem('role');
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
                        <a onclick="navigateToEdit(event)" href="#" data-event-id="${element.eventId}">Edit</a> <!---This is for Edit and Delete, to get their id number through storing attributes---->
                        <a onclick="navigateToDelete(event)" href="#" data-event-id="${element.eventId}">Delete</a>
                    </div>
                    <div class="actions">
                        <button id="register">Register Interest</button>
                        <button id="pList">View Participant List</button>
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
                        <button id="register">Register Interest</button>
                        <button id="pList">View Participant List</button>
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

const navigateToEdit = (event) => {
    const eventId = event.target.getAttribute('data-event-id');
    event.preventDefault();
    console.log(eventId);
}
//indicator to check wheteher to execute getAllEvents, if at the correct site using the .class tag
document.addEventListener("DOMContentLoaded", function () {
    const eventIndicator = document.getElementsByClassName("event-content"); //check if at the corresponding page
    if (eventIndicator.length > 0) {
        getAllEvents(eventIndicator);
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

document.getElementById('eventForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

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
    }

    console.log(jsonData); //test

    fetch('/events', {
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
});