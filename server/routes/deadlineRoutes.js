const express = require("express");
const router = express.Router();
const axios = require("axios");

// Retrieve RAG Microservice URL from environment
const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || "http://127.0.0.1:8001";

/**
 * Generate AI study plan: POST /api/deadlines/generate-plan
 * Proxies the request directly to the FastAPI RAG microservice.
 */
router.post("/generate-plan", async (req, res, next) => {
  try {
    const { studentId, title, subject, description, deadline, hoursPerDay, priority, type } = req.body;

    // Validate incoming payload
    if (!title || !subject || !deadline || !hoursPerDay || !priority) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, subject, deadline, hoursPerDay, priority are all required."
      });
    }

    // Call Python FastAPI service
    const response = await axios.post(`${RAG_SERVICE_URL}/deadlines/generate-plan`, {
      studentId: studentId || "default_student",
      title,
      subject,
      description: description || "",
      deadline,
      hoursPerDay: parseFloat(hoursPerDay),
      priority,
      type: type || "Assignment"
    });

    // Return response data
    res.json(response.data);
  } catch (error) {
    console.error("Error in Express generate-plan gateway:", error.message);
    
    if (error.response && error.response.data) {
      const detail = error.response.data.detail || error.response.data.message;
      return res.status(error.response.status).json({
        success: false,
        message: detail || "Error in AI generation service."
      });
    }
    
    next(error);
  }
});

module.exports = router;
