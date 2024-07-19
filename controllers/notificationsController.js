const Notifications = require("../models/notifications")


const getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notifications.getAllNotifications();
        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving notifications");
    }
};


const getNotificationsByUsername = async (req, res) => {
    const Username = req.params.Username;
    try {
        const notif = await Notifications.getNotificationsByUsername(Username);
        if (!notif ) {
            return res.status(404).send("Notifications with username found not found");
        }
        res.json(notif);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving notification with Username");
    }
};

const getNotificationById = async (req, res) => {
    const notification_id = parseInt(req.params.id);
    try {
        const notif = await Notifications.getNotificationById(notification_id);
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
        const createdNotification = await Notifications.createNotification(newNotificationData);
        res.status(201).json(createdNotification);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating Notification.");
    }
};

const deleteNotification = async (req, res) => {
    const Fid = parseInt(req.params.id);

    try {
        const success = await Notifications.deleteNotification(Fid);
        if (!success) {
            return res.status(404).send("Notification not found");
        }
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting notification");
    }
};


module.exports = {
    getNotificationsByUsername,
    getNotificationById,
    createNotification,
    deleteNotification,
    getAllNotifications,
};
