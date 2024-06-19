const express = require("express");
const sql = require("mssql"); 
const feedbackController = require("../controllers/feedbackController")
const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser"); // Import body-parser


const app = express();
const port = process.env.PORT || 3000; // Use environment variable or default port
const staticMiddleware = express.static("public");

// Include body-parser middleware to handle JSON data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For form data handling
app.use(staticMiddleware);

app.get("/feedbacks", feedbackController.getAllBooks);


app.listen(port,async()=>{
    try{
        await sql.connect(dbConfig);
        console.log("Database connection established successfully");
    }catch(err){
      console.log(err)
        // Terminate the application with an error code (optional)
    process.exit(1); // Exit with code 1 indicating an error
    }
    
  console.log(`Server listening on port ${port}`);
});

// Close the connection pool on SIGINT signal
process.on("SIGINT", async () => {
    console.log("Server is gracefully shutting down");
    // Perform cleanup tasks (e.g., close database connections)
    await sql.close();
    console.log("Database connection closed");
    process.exit(0); // Exit with code 0 indicating successful shutdown
  });

