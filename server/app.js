const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const ragRoutes = require("./routes/ragRoutes");
const deadlineRoutes = require("./routes/deadlineRoutes");
const { router: authRoutes } = require("./routes/authRoutes");
const { router: notificationRoutes } = require("./routes/notificationRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const dsaRoutes = require("./routes/dsaRoutes");

const app = express();

// Enable CORS for frontend client
app.use(cors());

// Parse incoming JSON payloads
app.use(express.json());

// Optional MongoDB Atlas / Local Connection
const mongoUri = process.env.MONGO_URI;
if (mongoUri) {
  console.log("Connecting to MongoDB Atlas...");
  mongoose
    .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected successfully."))
    .catch((err) => {
      console.error("MongoDB connection failed:", err.message);
      console.log("Running server in mock-database mode.");
    });
} else {
  console.log("MONGO_URI is not set. Running server in-memory/no-db mode.");
}

// Friendly welcome base route
app.get("/", (req, res) => {
  res.json({
    message: "CampusFlow Node.js/Express API Gateway is active!",
    status: "healthy",
    proxyTarget: process.env.RAG_SERVICE_URL || "http://localhost:8001",
  });
});

// Mount RAG proxy routes
app.use("/api/rag", ragRoutes);

// Mount Deadline planning routes
app.use("/api/deadlines", deadlineRoutes);

// Mount Authentication routes
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

// Mount Notification routes
app.use("/api/notifications", notificationRoutes);

// Mount Attendance routes
app.use("/api/attendance", attendanceRoutes);

// Mount DSA routes
app.use("/api/dsa", dsaRoutes);

// Global Error Handling Middleware (returns required success: false schema)
app.use((err, req, res, next) => {
  console.error("Express global error caught:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong",
  });
});

module.exports = app;
