const express = require("express");
const sql = require("mssql");
const feedbackController = require("./controllers/feedbackController");
const eventController = require("./controllers/eventController");
const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser");
 
const app = express();
const port = process.env.PORT || 3000;
const staticMiddleware = express.static("public");  // Changed to serve from 'public' directory

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(staticMiddleware);

// Feedback Routes
app.get("/feedbacks", feedbackController.getAllFeedbacks);
app.get("/feedbacks/:id", feedbackController.getFeedbackById);
app.delete("/feedbacks/:id",feedbackController.deleteFeedback);

// Event Routes
app.get("/events", eventController.getAllEvents);
app.post("/events", eventController.createEvent);

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
