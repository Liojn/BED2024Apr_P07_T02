
const Event = require("../models/event");

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
        res.json(event);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error retrieving events"})
    }
}

const createEvent = async (req, res) => {
    const newEvent = req.body;
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
    try {
        const  successUpdateEvent = await Event.updateEvent(eventId, updatedEvent);
        if (!successUpdateEvent) {
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

module.exports = {
    getAllEvents,
    getEventbyId,
    createEvent,
    updateEvent,
    deleteEvent,
};