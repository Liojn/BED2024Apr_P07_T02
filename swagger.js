const swaggerAutogen = require("swagger-autogen")();

const outputFile = "./swagger-output.json"; //Output file for the spec
const routes = ["./app.js"]; //Path to API route files

const doc = {
  info: {
    title: "My API",
    description: "API for EcoImpact",
  },
  host: "localhost:3000", // Replace with your actual host if needed
};

swaggerAutogen(outputFile, routes, doc);