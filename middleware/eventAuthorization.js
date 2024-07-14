const Event = require("../models/event");

const eventAuthorizeAction = async(req, res, next) => {
    try{
        const eventId = parseInt(req.params.id);
        const usernameFromToken = req.username; //extracted from JWT or session

        //console.log(`User from: ${usernameFromToken}`);
        //console.log(`ID from: ${eventId}`);

        const event = await Event.getEventbyId(eventId);

        if (!event) {
            return res.status(404).json({ message: "Selected event for modification is not found" });
        }

        if (req.accountType !== "Staff" && event.username !== usernameFromToken) {
            return res.status(403).json({ message: "Unauthorized action. You are not authorized to perform this action." });
        }

        req.originalAuthor = event.username; //to update later
        next();
    } catch (error) {
        console.error('Authorization error:', error);
        res.status(500).json({ message: "Authorization error" });
    }
};

module.exports = eventAuthorizeAction;