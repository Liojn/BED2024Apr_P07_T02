const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret_key = process.env.JWT_SECRET;


const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log("No token provided");
        return res.status(401).json({ message: "Unauthorized. No token provided." });
    }

    jwt.verify(token, secret_key, (err, decoded) => {
        if (err) {
            console.log("Failed to authenticate token", err);
            return res.status(403).json({ message: "Forbidden." });
        }

        const requestedEndpoint = req.url;
        const userRole = decoded.accountType; //For authentication
        
        const authorizedRoles = {
            //Feedback routes
            "/events": ["Staff", "Student"], //For GET all or POST 
            "/events/[0-9]+": ["Student", "Staff"], //GET by ID
            "/events/search" : ["Student", "Staff"], //GET with Search
            "/events/[0-9]+/update": ["Staff", "Student"], //POST
            "/events/[0-9]+/deletion": ["Staff", "Student"], //DELETE

            //Feedback Routes
            "/feedbacks": ["Staff", "Student"], //For get all feedbacks
            "/feedbacks/[0-9]+": ["Staff", "Student"], // For get feedback by id
            "/feedbacks/[0-9]+": ["Staff"], //For delete feedback
            "/feedbacks" : ["Staff", "Student"],//For creating feedback
            "/feedbacks/verified/(Y|N)" : ["Staff"], //For filtering feedback
            "/feedbacks/[0-9]+" :["Staff", "Student"], // For updating feedback

            //Notification Routes
            "/notifications/userNotif/[0-9]": ["Staff", "Student"],// For get all notification by user id
            "/notifications/[0-9]+" : ["Staff", "Student"], //For get notification by Id
            "/notifications" : ["Staff"], // Creating notifications
            "/notification/[0-9]+" : ["Staff", "Student"] // Deleting notification

        }

        const authorizedRole = Object.entries(authorizedRoles).find(
            ([endpoint, roles]) => {
              const regex = new RegExp(`^${endpoint}$`); // Create RegExp from endpoint
              return regex.test(requestedEndpoint) && roles.includes(userRole);
            }
        );

        if (!authorizedRole) {
            return res.status(403).json({ message: "Forbidden" });
        }

        req.user = decoded.username; //For authorization uses later, attach keyvalue pair to the req   
        next();
    });
};


module.exports = authMiddleware;
