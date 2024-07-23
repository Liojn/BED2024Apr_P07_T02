const Notifcations = require("../models/notifications");
const Notifications = require("../models/notifications");
const User = require("../models/user");


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

const getStaffUsername = async (req, res) => {
    const staffId = parseInt(req.params.id);
    try {
        const notif = await Notifications.getStaffUsername(staffId);
        if (!notif) {
            return res.status(404).send("Username from notification not found");
        }
        res.json(notif);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving Username from notification");
    }
};

const updateNotification = async (req, res) => {
    const notification_id = parseInt(req.params.id);
  
    try {
      const updatedNotification = await Notifications.updateNotification(notification_id);
      if (!updatedNotification) {
        return res.status(404).send("Notification not found");
      }
      res.json(updatedNotification);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error updating Notification");
    }
  };

  const getNotificationBySeen = async (req, res) => {
    console.log(req.params)
    const seen = req.params.seen;
    const username = req.params.username
    console.log(seen, username)
    try {
        const seens = await Notifcations.getNotificationBySeen(seen,username);
        if (!seens) {
            return res.status(404).send("seen notification not found");
        }
        res.json(seens);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving seen notification");
    }
};


module.exports = {
    getNotificationsByUsername,
    getNotificationById,
    createNotification,
    deleteNotification,
    getAllNotifications,
    getStaffUsername,
    updateNotification,
    getNotificationBySeen,
};
