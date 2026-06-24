require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` CampusFlow Node.js/Express Server Gateway        `);
  console.log(` Running on port: http://localhost:${PORT}        `);
  console.log(` Proxying RAG to: ${process.env.RAG_SERVICE_URL || "http://localhost:8001"}`);
  console.log(`==================================================`);
});

// Handle graceful shutdowns
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received. Shutting down gracefully...");
  server.close(() => {
    console.log("Http server closed.");
  });
});
