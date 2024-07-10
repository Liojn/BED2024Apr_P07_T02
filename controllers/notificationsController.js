const Notifcations = require("../models/notifications")

const getNotificationsByUserId = async (req, res) => {
    const UserID = parseInt(req.params.id);
    try {
        const notif = await Notifcations.getNotificationsByUserId(UserID);
        if (!notif ) {
            return res.status(404).send("Notifications with UserID found not found");
        }
        res.json(notif);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving notification with UserID");
    }
};

const getNotificationById = async (req, res) => {
    const notification_id = parseInt(req.params.id);
    try {
        const notif = await Notifcations.getNotificationById(notification_id);
        if (!notif) {
            return res.status(404).send("Notifcation not found");
        }
        res.json(notif);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving Notification");
    }
};

const createNotification = async (req, res) => {
    const newNotificationData = req.body;
    try {
        const createdNotification = await Notifcations.createNotification(newNotificationData);
        res.status(201).json(createdNotification);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating Notification.");
    }
};


module.exports = {
    getNotificationsByUserId,
    getNotificationById,
    createNotification,
};
