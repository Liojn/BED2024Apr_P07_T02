
localStorage.setItem('username', 'msneoERC');

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
                        <a href="#">Edit</a>
                        <a href="#">Delete</a>
                    </div>
                    <div class="actions">
                        <button id="register">Register Interest</button>
                        <button id="pList">View Participant List</button>
                    </div>
                    <div id="post-id">id_: ${element.eventId}</div>
                </div>
            `;
            eventIndicator[0].appendChild(eventBox);
        });

    } catch (error) { //error handling
        console.log(error);
    }
}

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
    })
    .catch(error => {
        //Handle errors
        console.error('Error:', error);
    });
});