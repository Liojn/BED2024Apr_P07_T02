const express = require("express");
const cors = require('cors');
const sql = require("mssql");
const feedbackController = require("./controllers/feedbackController");
const eventController = require("./controllers/eventController");
const userController = require("./controllers/userController");
const donationController = require("./controllers/donationController");

const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser");
const cors = require("cors");
const { authMiddleware, staffOnly, studentsOnly } = require('./middleware/authMiddleware');

const app = express();
const port = process.env.PORT || 3000;
const staticMiddleware = express.static("public");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(staticMiddleware);
app.use(cors());

// Feedback Routes
app.get("/feedbacks", authMiddleware, feedbackController.getAllFeedbacks);
app.get("/feedbacks/:id", authMiddleware, feedbackController.getFeedbackById);
app.delete("/feedbacks/:id", authMiddleware, staffOnly, feedbackController.deleteFeedback); 
app.post("/feedbacks", authMiddleware, feedbackController.createFeedback);
app.get("/feedbacks/verified/:verified", authMiddleware, feedbackController.getFeedbackByVerified);

// Event Routes
app.get("/events", authMiddleware, eventController.getAllEvents);
app.post("/events", authMiddleware, eventController.createEvent);
app.delete("/events/:id", eventController.deleteEvent);


// Users Routes
app.get('/users', authMiddleware, userController.getAllUser);
app.get('/users/checkUser', userController.checkUser);
app.get('/users/:id', authMiddleware, userController.getUserById);
app.post('/users/register', userController.addNewUser);
app.post('/users/login', userController.loginUser);

// Protect certain routes for staff only
app.get("/staff-only", authMiddleware, staffOnly, (req, res) => {
    res.send("Staff only content");
});

// Protect certain routes for students only
app.get("/students-only", authMiddleware, studentsOnly, (req, res) => {
    res.send("Students only content");
});
app.get("/donations", donationController.getAllDonations);
app.post("/donations",donationController.createDonation);
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
