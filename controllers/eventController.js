
const Event = require("../models/event");
const fs = require("fs");

const getAllEvents = async (req, res) => {
    try {
        const events = await Event.getAllEvents();
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error retrieving events"});
    }
};

const getEventbyId = async (req, res) => {
    const eventId = parseInt(req.params.id);
    try {
        const event = await Event.getEventbyId(eventId);
        if (!event) { //null given
            return res.status(404).send({ message: "Event not found"});
        }
        res.json(event).status(200);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error retrieving events"})
    }
}

const createEvent = async (req, res) => {
    const newEvent = req.body;
    newEvent.username = req.username; //Add username to newEvent

    try {
        const createdEvent = await Event.createEvent(newEvent);
        res.status(201).json(createdEvent);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error creating Events" });
    }
};

const updateEvent = async (req, res) => {
    const eventId = parseInt(req.params.id);
    const updatedEvent = req.body;
    updatedEvent.username = req.originalAuthor; //Add username to updatedEvent

    try {
        const  successUpdateEvent = await Event.updateEvent(eventId, updatedEvent);
        if (!successUpdateEvent) { //if var is null
            return res.status(404).send({ message: `No such Event with the followinng ID: ${eventId}`});
        } 
        res.json(successUpdateEvent);
    } catch(error) {
        console.error(error);
        res.status(500).send({ message: "Error updating Event"});
    }
};

const deleteEvent = async (req, res) => {
    const EventId = req.params.id;
    try{
        const success = await Event.deleteEvent(EventId);
        if (!success) {
            return res.status(404).send({message: "Event not found."});
        }
        res.status(204).send(); //no message since 204 returns nothing.
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error deleting event" });
    }
};

const searchEvent = async (req, res) => {
    const searchTerm = req.query.searchTerm; //Extract search result for the title

    try{
        const events = await Event.searchEvent(searchTerm);
        res.json(events);
    } catch (error) { //if a error is thrown by the model 
        console.error(error);
        res.status(500).json({ message: `Error searching for Event containing '${searchTerm}'`});
    }
}

const registerEvent = async (req, res) => {
    const eventId = req.params.id;
    const username = req.username;

    try{
        const eventReg = await Event.registerEvent(eventId, username)
        res.json(eventReg);
    } catch (error) {
        console.error(error);
        const statusCode = error.code || 400; //default to 400 Bad Request if no code is set by event.js
        res.status(statusCode).json({ error: error.message });
    }

}

const getUsersByEventId = async (req, res) => {
    const eventId = req.params.id;
    try {
        const regList = await Event.getUsersByEventId(eventId);
        console.log(regList);
        if (!regList || regList.length === 0) { //Check if regList is empty or null
            return res.status(404).json({ message: "No registrations found for the event" });
        }
        res.json(regList).status(200);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error retrieving list of participants"});
    }
}

const getLocation = async (req, res) => {
    const location = req.query.location;
    const encodedLocation = encodeURIComponent(location);

    try{
        const locationResult = await Event.getLocation(encodedLocation);
        if (locationResult.status === 'error') { 
            return res.status(404).json({ error: locationResult.message });
        }
        res.json(locationResult).status(200);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error retrieving location"});
    }
}

const printPDFSummary = async(req, res) => {
    const eventId = req.params.id;
    try {
        const outputPath = await Event.printPDFSummary(eventId);
        console.log(outputPath);

        // Send the PDF file as a response
        res.download(outputPath, (err) => {
            if (err) {
                console.error("Error sending PDF:", err);
                res.status(500).send("Error sending PDF.");
            } else {
                //delete the file after sending it in the server
                fs.unlink(outputPath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error("Error deleting PDF file:", unlinkErr);
                    }
                });
            }
        });

    } catch (error) {
        if (error.message === 'No such event.'){
            return res.status(404).send({message: 'No such event' });
        }
        console.log(error);
        return res.status(500).send({message: error.message});
    }
}

module.exports = {
    getAllEvents,
    getEventbyId,
    createEvent,
    updateEvent,
    deleteEvent,
    searchEvent,
    registerEvent,
    getUsersByEventId,
    getLocation,
    printPDFSummary,
};