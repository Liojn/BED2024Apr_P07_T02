
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                    </svg>
                    <div class="actions">
                        <button id="register">Register Interest</button>
                        <button id="pList">View Participant List</button>
                    </div>
                    <div id="post-id">id_: ${element.eventId}</div>
                </div>
            `;
            eventIndicator[0].appendChild(eventBox);
        });

    } catch (error) {
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
