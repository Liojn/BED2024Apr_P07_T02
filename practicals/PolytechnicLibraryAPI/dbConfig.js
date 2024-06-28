module.exports = {
    user: "PolyLibrarian", // Replace with your SQL Server login username
    password: "12345678", // Replace with your SQL Server login password
    server: "localhost",
    database: "LibraryDB",
    trustServerCertificate: true,
    options: {
      port: 1433, // Default SQL Server port
      connectionTimeout: 60000, // Connection timeout in milliseconds
    },
  };