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
            if (err.name === 'TokenExpiredError') {
                console.log("Token has expired", err);
                return res.status(403).json({ message: "Forbidden. Token has expired." });
            } else if (err.name === 'JsonWebTokenError') {
                console.log("Invalid token", err);
                return res.status(403).json({ message: "Forbidden. Invalid token." });
            } else {
                console.log("Failed to authenticate token", err);
                return res.status(403).json({ message: "Forbidden." });
            }  
        }

        const requestedEndpoint = req.url;
        const userRole = decoded.accountType; //For authentication
        const authorizedRoles = {
            //Event routes
            "/events/search" : ["Student", "Staff"], //GET with Search
            "/events/download/[0-9]+": ["Staff"], //GET pdfdownload 
            "/events/get-location": ["Student", "Staff"], //GET location
            "/events": ["Staff", "Student"], //For GET all or POST 
            "/events/[0-9]+": ["Student", "Staff"], //GET by ID
            "/events/[0-9]+/update": ["Staff", "Student"], //POST
            "/events/[0-9]+/deletion": ["Staff", "Student"], //DELETE
            "/events/register/[0-9]+": ["Staff", "Student"], //POST register
            "/events/find-participants/[0-9]+": ["Staff", "Student"], //GET find participants


            //Feedback Routes
            "/feedbacks": ["Staff", "Student"], //For get all feedbacks
            "/feedbacks/[0-9]+": ["Staff", "Student"], // For get feedback by id
            "/feedbacks/[0-9]+": ["Staff"], //For delete feedback
            "/feedbacks" : ["Staff", "Student"],//For creating feedback
            "/feedbacks/verified/(Y|N)" : ["Staff"], //For filtering feedback
            "/feedbacks/[0-9]+" :["Staff", "Student"], // For updating feedback

            //Notification Routes
            "/notifications/userNotif/[a-zA-Z0-9]+": ["Staff", "Student"],// For get all notification by user id
            "/notifications/[0-9]+" : ["Staff", "Student"], //For get notification by Id
            "/notifications" : ["Staff"], // Creating notifications
            "/notifications/[0-9]+" : ["Staff", "Student"], // Deleting notification
            "/notifications/username/[0-9]+" : ["Staff", "Student"],// Getting Staff username 
            "/notifications/seen/[0-9]+" : ["Staff", "Student"],// Updating notification to seen
            "/notifications/seen/(Y|N)/[a-zA-Z0-9]+": ["Staff", "Student"], //Getting all seen/unseen notification or a user
            
            //Donation route
            "/donations": ["Staff", "Student"],//For get all donations if staff
            "/nonprofits": ["Staff", "Student"],//Get nonprofit api data"
            "/donations": ["Staff", "Student"],//Creating donations
            "/donations/username": ["Staff", "Student"],// For get all donation if student
            "/stats":["Staff","Student"],//To get donation stats
        }
        const pathOnly = requestedEndpoint.split('?')[0]; //exclude query
        console.log(pathOnly);
        const authorizedRole = Object.entries(authorizedRoles).find(
            ([endpoint, roles]) => {
              const regex = new RegExp(`^${endpoint}$`); // Create RegExp from endpoint
              return regex.test(pathOnly) && roles.includes(userRole);
            }
        );


        if (!authorizedRole) {
            return res.status(403).json({ message: "Forbidden" });
        }

        req.username = decoded.username; //For authorization uses later, attach keyvalue pair to the req 
        req.accountType = userRole;
        //console.log(req.username);
        next();
    });
};


module.exports = authMiddleware;
