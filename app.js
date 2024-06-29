const express = require("express");
const sql = require("mssql");
const feedbackController = require("./controllers/feedbackController");
const eventController = require("./controllers/eventController");
const userController = require("./controllers/userController");
const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser");
const cors = require("cors"); // cors middleware for Express server

const app = express();
const port = process.env.PORT || 3000;
const staticMiddleware = express.static("public");  // Changed to serve from 'public' directory

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(staticMiddleware);
app.use(cors());

// Feedback Routes
app.get("/feedbacks", feedbackController.getAllFeedbacks);
app.get("/feedbacks/:id", feedbackController.getFeedbackById);
app.delete("/feedbacks/:id",feedbackController.deleteFeedback);
app.post("/feedbacks", feedbackController.createFeedback); 

// Event Routes
app.get("/events", eventController.getAllEvents);
app.post("/events", eventController.createEvent);

// Users Routes
app.get('/users', userController.getAllUser);
app.get('/users/checkUser', userController.checkUser);
app.get('/users/:id', userController.getUserById);
app.post('/users/register', userController.addNewUser);
app.post('/users/login', userController.loginUser);

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
