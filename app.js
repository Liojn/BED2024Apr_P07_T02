const express = require("express");
const cors = require('cors');
const axios = require('axios');
const sql = require("mssql");

const feedbackController = require("./controllers/feedbackController");
const eventController = require("./controllers/eventController");
const userController = require("./controllers/userController");
const donationController = require("./controllers/donationController");
const validateEvent = require("./middleware/eventFormMiddleware");
const notificationsController = require("./controllers/notificationsController");
const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json"); // Import generated spec

const { authMiddleware } = require('./middleware/authMiddleware');
const eventAuthorizeAction = require("./middleware/eventAuthorization");
const { getDonationByUsername } = require("./models/donation");
const staffAuthMiddleware = require('./middleware/staffMiddleware');
const app = express();
const port = process.env.PORT || 3000;
const staticMiddleware = express.static("public");

const feedbackFormMiddleware = require("./middleware/feedbackFormMiddleware");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(staticMiddleware);  
app.use(cors());
app.use('public/uploads', express.static('uploads'));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // Serve the Swagger UI at a specific route

//Notifications Routes
app.get("/notifications/userNotif/:Username", authMiddleware, notificationsController.getNotificationsByUsername)
app.get("/notifications/:id", authMiddleware,notificationsController.getNotificationById)
app.post("/notifications",authMiddleware, notificationsController.createNotification)
app.delete("/notifications/:id", authMiddleware,notificationsController.deleteNotification)
app.get("/notifications", notificationsController.getAllNotifications)
app.get("/notifications/username/:id", authMiddleware,notificationsController.getStaffUsername)
app.put("/notifications/seen/:id", authMiddleware, notificationsController.updateNotification)
app.get("/notifications/seen/:seen/:username",authMiddleware,notificationsController.getNotificationBySeen)

// Feedback Routes
app.get("/feedbacks", authMiddleware,feedbackController.getAllFeedbacks);
app.get("/feedbacks/:id", authMiddleware,feedbackController.getFeedbackById);
app.delete("/feedbacks/:id", authMiddleware,feedbackController.deleteFeedback); 
app.post("/feedbacks", feedbackFormMiddleware,authMiddleware,feedbackController.createFeedback);
app.get("/feedbacks/verified/:verified", authMiddleware,feedbackController.getFeedbackByVerified);
app.put("/feedbacks/:id", authMiddleware,feedbackController.updateFeedback)


// Event Route
app.get("/events/get-location", authMiddleware, eventController.getLocation);
app.get("/events/search", authMiddleware, eventController.searchEvent);
app.get("/events/download/:id", authMiddleware, eventController.printPDFSummary);
app.post("/events/register/:id", authMiddleware, eventController.registerEvent);
app.get("/events", authMiddleware, eventController.getAllEvents);
app.get("/events/:id", authMiddleware, eventController.getEventbyId);
app.post("/events", authMiddleware, validateEvent, eventController.createEvent);
app.put("/events/:id/update", authMiddleware, eventAuthorizeAction, validateEvent, eventController.updateEvent);
app.delete("/events/:id/deletion", authMiddleware, eventAuthorizeAction, eventController.deleteEvent);
app.get("/events/find-participants/:id", authMiddleware, eventController.getUsersByEventId);


// Users Routes
app.get('/users', authMiddleware, staffAuthMiddleware, userController.getAllUser);
app.get('/users/checkUser', userController.checkUser);
app.get('/users/:id', authMiddleware, userController.getUserById);
app.post('/users/register', userController.addNewUser);
app.post('/users/login', userController.loginUser);
app.put('/users/:id', userController.updateUser);
app.delete('/users/:id', authMiddleware, userController.deleteUser);
app.delete('/users/:id/staff', authMiddleware, staffAuthMiddleware, userController.deleteUser);


// Donation routes
app.get("/donations", authMiddleware,donationController.getAllDonations);
app.get('/nonprofits', donationController.fetchNonProfitNames);
app.post("/donations",authMiddleware,donationController.createDonation);
app.get("/donations/username", authMiddleware, donationController.getDonationByUsername);
app.get("/stats",authMiddleware, donationController.getAllStats);
//donationController.getDonationStatistics()
//app.get("/donations",donationController.getDonationCount)

app.listen(port, async () => {
    try {
        await sql.connect(dbConfig);
        console.log("Database connection established successfully");
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
    console.log(`Server listening on port ${port}`);
});

process.on("SIGINT", async () => {
    console.log("Server is gracefully shutting down");
    await sql.close();
    console.log("Database connection closed");
    process.exit(0);
});
