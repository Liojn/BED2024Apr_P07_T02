const swaggerAutogen = require("swagger-autogen")();

const outputFile = "./swagger-output.json"; //Output file for the spec
const routes = ["./app.js"]; //Path to API route files

const doc = {
  info: {
    title: "My API",
    description: "API for EcoImpact",
  },
  host: "localhost:3000", // Replace with your actual host if needed
  schemes: ["http"],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        in: "header",
        name: "Authorization"
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
};

swaggerAutogen(outputFile, routes, doc);