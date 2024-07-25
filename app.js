const express = require("express");
const cors = require('cors');
const axios = require('axios');
const sql = require("mssql");
const multer = require('multer');
const path = require('path');
const feedbackController = require("./controllers/feedbackController");
const eventController = require("./controllers/eventController");
const userController = require("./controllers/userController");
const donationController = require("./controllers/donationController");
const notificationsController = require("./controllers/notificationsController");
const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json"); // Import generated spec

const { authMiddleware, staffAuthMiddleware } = require('./middleware/authMiddleware');
const eventAuthorizeAction = require("./middleware/eventAuthorization");
const { getDonationByUsername } = require("./models/donation");
const app = express();
const port = process.env.PORT || 3000;
const staticMiddleware = express.static("public");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    }, 
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});
const upload = multer({ dest: 'public/uploads/' });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(staticMiddleware);  
app.use(cors());
app.use('public/uploads', express.static('uploads'));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // Serve the Swagger UI at a specific route

//Notifications Routes
app.get("/notifications/userNotif/:Username",notificationsController.getNotificationsByUsername)
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
app.post("/feedbacks", authMiddleware,feedbackController.createFeedback);
app.get("/feedbacks/verified/:verified", authMiddleware,feedbackController.getFeedbackByVerified);
app.put("/feedbacks/:id", authMiddleware,feedbackController.updateFeedback)


// Event Route
app.get("/events/get-location", authMiddleware, eventController.getLocation);
app.get("/events/search", authMiddleware, eventController.searchEvent);

app.get("/events/download/:id", authMiddleware, eventController.printPDFSummary);
app.post("/events/register/:id", authMiddleware, eventController.registerEvent);
app.get("/events", authMiddleware, eventController.getAllEvents);
app.get("/events/:id", authMiddleware, eventController.getEventbyId);
app.post("/events", authMiddleware, eventController.createEvent);
app.put("/events/:id/update", authMiddleware, eventAuthorizeAction, eventController.updateEvent);
app.delete("/events/:id/deletion", authMiddleware, eventAuthorizeAction, eventController.deleteEvent);
app.get("/events/find-participants/:id", authMiddleware, eventController.getUsersByEventId);


// Users Routes
app.get('/users', staffAuthMiddleware, userController.getAllUser);
app.get('/users/checkUser', userController.checkUser);
app.get('/users/:id', authMiddleware, userController.getUserById);
app.post('/users/register', userController.addNewUser);
app.post('/users/login', userController.loginUser);
app.put('/users/:id', userController.updateUser);
app.put('/users', authMiddleware, upload.single('profilePicture'), userController.updateUser);
app.delete('/users/:id', authMiddleware, userController.deleteUser);
app.delete('/users/id/staff', staffAuthMiddleware, userController.deleteUser);


// Donation routes
app.get("/donations", donationController.getAllDonations);
app.get('/nonprofits', donationController.fetchNonProfitNames);
app.post("/donations",donationController.createDonation);
app.get("/donations/:username", donationController.getDonationByUsername);
app.get("/donations/realtime",donationController.getRealTimeDonation);
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
