const express = require("express");
const sql = require("mssql");
const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser");
const bookController = require("./controllers/bookController");
const userController = require("./controllers/userController");
const verifyJWT = require("./middlewares/checkAccessAuthorization");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json"); // Import generated spec
 
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the Swagger UI at a specific route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Route for API Endpoint
app.get("/books", verifyJWT, bookController.getAllBooks);
app.get("/books/:bookId/availability", verifyJWT, bookController.updateBookAvailability);
app.get("/login", userController.loginUser);
app.post("/register", userController.registerUser);

// Serve the Swagger UI at a specific route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
