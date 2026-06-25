const router = require("express").Router();
const axios = require("axios");

// Fetch the webhook URL from environment or fall back to default localhost
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook/campusflow-auth";

/**
 * Reusable helper function to dispatch a notification payload to the n8n webhook.
 * Can be imported and called directly by other controllers.
 */
const sendNotification = async (payload) => {
  try {
    console.log(`[n8n NOTIFICATION] Forwarding payload type: "${payload.type}" to: ${N8N_WEBHOOK_URL}`);
    await axios.post(N8N_WEBHOOK_URL, payload);
    console.log(`[n8n NOTIFICATION] Successfully dispatched type: "${payload.type}"`);
    return { success: true };
  } catch (err) {
    console.error(`[n8n NOTIFICATION] Failed to dispatch type "${payload.type}":`, err.message);
    return { success: false, error: err.message };
  }
};

// Expose the POST endpoint under /api/notifications
router.post("/", async (req, res) => {
  const result = await sendNotification(req.body);
  if (result.success) {
    res.json({ success: true, message: "Notification sent to n8n webhook." });
  } else {
    res.status(500).json({ success: false, message: "Failed to dispatch notification.", error: result.error });
  }
});

module.exports = {
  router,
  sendNotification
};
