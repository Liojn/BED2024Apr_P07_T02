module.exports = {
    user: "eco_impact", // Replace with your SQL Server login username
    password: "eco_impact", // Replace with your SQL Server login password
    server: "localhost",
    database: "eco_impact",
    trustServerCertificate: true,
    options: {
      port: 1433, // Default SQL Server port
      connectionTimeout: 60000, // Connection timeout in milliseconds
    },
  };