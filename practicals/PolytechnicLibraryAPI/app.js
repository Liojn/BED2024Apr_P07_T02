const express = require("express");
const sql = require("mssql");
const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser");
const bookController = require("./controllers/bookController");
const userController = require("./controllers/userController");
 
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Route for API Endpoint
app.get("/books", bookController.getAllBooks); //Part 1.3
app.put("/books/:bookId/availability", bookController.updateBookAvailability); //Part 1.4

app.get("/users/:userId", userController.getUserByUsername);
app.post("/register", userController.registerUser);  //Part 2.1

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
