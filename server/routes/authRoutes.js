const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const axios = require("axios");
const { sendNotification } = require("./notificationRoutes");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "campusflow-super-secret-key-123";

// Helper to parse User-Agent header into a clean device description
const getDeviceString = (userAgent) => {
  if (!userAgent) return "Unknown Device";
  let os = "Unknown OS";
  let browser = "Unknown Browser";
  
  if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Macintosh") || userAgent.includes("Mac OS")) os = "macOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS";
  
  if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) browser = "Safari";
  else if (userAgent.includes("Edge") || userAgent.includes("Edg")) browser = "Edge";
  
  return `${browser} ${os}`;
};

// =========================================================================
// IN-MEMORY DATA STORES
// (Swap with MongoDB / Redis in a production environment)
// =========================================================================

// Users Store: Map<userId, UserObject>
const usersStore = new Map();

// Blacklisted JTIs: Set<jti>
const blacklistedJtis = new Set();

// Pending OTPs: Map<email, { otp, expiresAt, phone }>
const pendingOtps = new Map();

// Pre-populate with a default student for testing/demo convenience
const defaultSalt = bcrypt.genSaltSync(10);
const defaultHash = bcrypt.hashSync("password123", defaultSalt);
usersStore.set("default-user-id", {
  id: "default-user-id",
  email: "student@gmail.com",
  phone: "1234567890",
  username: "student_123",
  passwordHash: defaultHash,
  createdAt: new Date()
});

console.log("[AUTH DB] Pre-populated default user: student_123 / password123");

// =========================================================================
// RATE LIMITERS (via express-rate-limit)
// =========================================================================

// Auth routes (login, register) — 10 failed attempts per 15 min per IP, skip successful requests
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  skipSuccessfulRequests: true, // Only count failed attempts
  message: {
    success: false,
    message: "Too many failed attempts. Please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false
});

// OTP/reset routes — 5 attempts per hour per IP
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    message: "Too many OTP requests. Please try again after an hour."
  },
  standardHeaders: true,
  legacyHeaders: false
});

// All other routes — 100 requests per minute per IP
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Please slow down."
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply general limiter to all routes handled by this router
router.use(generalLimiter);

// =========================================================================
// HELPER FUNCTIONS & MIDDLEWARE
// =========================================================================

// Generate JWT tokens with a unique jti
const generateToken = (payload, expiresIn, type = "access") => {
  const jti = crypto.randomUUID();
  const token = jwt.sign(
    {
      ...payload,
      jti,
      type
    },
    JWT_SECRET,
    { expiresIn }
  );
  return { token, jti };
};

// OTP dispatcher (supports n8n webhook and direct Twilio WhatsApp API)
const dispatchOtp = async (phone, email, otp) => {
  console.log(`[OTP DISPATCH] Generated OTP ${otp} for ${email} (${phone})`);
  
  let n8nSuccess = false;
  let twilioSuccess = false;

  // 1. Dispatch via n8n if URL is configured
  if (process.env.N8N_WEBHOOK_URL) {
    try {
      await axios.post(process.env.N8N_WEBHOOK_URL, { phone, otp });
      n8nSuccess = true;
      console.log("[OTP DISPATCH] Successfully sent OTP to n8n webhook.");
    } catch (err) {
      console.error("[OTP DISPATCH] Failed to send OTP to n8n webhook:", err.message);
    }
  }

  // 2. Dispatch via direct Twilio WhatsApp if credentials are configured
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const twilio = require("twilio");
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;
      await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886",
        to: `whatsapp:${formattedPhone}`,
        body: `Your CampusFlow OTP is: ${otp}. Valid for 10 minutes.`
      });
      twilioSuccess = true;
      console.log("[OTP DISPATCH] Successfully sent OTP via Twilio WhatsApp.");
    } catch (err) {
      console.error("[OTP DISPATCH] Failed to send OTP via Twilio WhatsApp:", err.message);
    }
  }

  // If neither is configured, or both failed, print a developer-friendly help log
  if (!process.env.N8N_WEBHOOK_URL && (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN)) {
    console.log(`[OTP DISPATCH] [DEV MODE] No external SMS/WhatsApp provider configured. Please use OTP: ${otp}`);
  }
};

// Auth middleware to secure private endpoints
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Authorization token missing or invalid." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Validate token type
    if (decoded.type !== "access") {
      return res.status(401).json({ success: false, message: "Invalid token type. Access token required." });
    }

    // Check if blacklisted
    if (blacklistedJtis.has(decoded.jti)) {
      return res.status(401).json({ success: false, message: "Token has been revoked/logged out." });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token expired or invalid." });
  }
};

// =========================================================================
// API ENDPOINTS
// =========================================================================

// --- LIVE AVAILABILITY CHECKS ---

// Check if email is already registered
router.post("/check-email", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email is required." });
  
  const lowerEmail = email.toLowerCase().trim();
  const exists = Array.from(usersStore.values()).some((u) => u.email.toLowerCase() === lowerEmail);
  return res.json({ success: true, taken: exists });
});

// Check if phone number is already registered
router.post("/check-phone", (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ success: false, message: "Phone number is required." });
  
  const stripped = phone.replace(/\D/g, "");
  const exists = Array.from(usersStore.values()).some((u) => u.phone.replace(/\D/g, "") === stripped);
  return res.json({ success: true, taken: exists });
});

// Check if username is already registered (case-insensitive)
router.post("/check-username", (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ success: false, message: "Username is required." });
  
  const lowerUsername = username.toLowerCase().trim();
  const exists = Array.from(usersStore.values()).some((u) => u.username.toLowerCase() === lowerUsername);
  return res.json({ success: true, taken: exists });
});

// --- REGISTRATION & SIGNUP ---

router.post("/signup", authLimiter, (req, res) => {
  const { email, phone, username, password } = req.body;

  // 1. Validate parameters
  if (!email || !phone || !username || !password) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  // Gmail-only restriction
  const gmailRegex = /^[^@]+@gmail\.com$/;
  if (!gmailRegex.test(email.toLowerCase())) {
    return res.status(400).json({ success: false, message: "Only @gmail.com addresses are permitted." });
  }

  // Password length check
  if (password.length < 8) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
  }

  const lowerEmail = email.toLowerCase().trim();
  const lowerUsername = username.toLowerCase().trim();
  const strippedPhone = phone.replace(/\D/g, "");

  // 2. Check uniqueness
  const emailExists = Array.from(usersStore.values()).some((u) => u.email.toLowerCase() === lowerEmail);
  const usernameExists = Array.from(usersStore.values()).some((u) => u.username.toLowerCase() === lowerUsername);
  const phoneExists = Array.from(usersStore.values()).some((u) => u.phone.replace(/\D/g, "") === strippedPhone);

  if (emailExists) return res.status(400).json({ success: false, message: "Gmail address is already taken." });
  if (usernameExists) return res.status(400).json({ success: false, message: "Username is already taken." });
  if (phoneExists) return res.status(400).json({ success: false, message: "Phone number is already taken." });

  // 3. Hash password and save
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const userId = crypto.randomUUID();

  const newUser = {
    id: userId,
    email: lowerEmail,
    phone: strippedPhone,
    username: lowerUsername,
    passwordHash,
    createdAt: new Date()
  };

  usersStore.set(userId, newUser);
  console.log(`[AUTH signup] Registered new user: ${lowerUsername} (${lowerEmail})`);

  // 4. Generate access and refresh tokens
  const { token: accessToken } = generateToken({ id: userId, username: lowerUsername }, "15m", "access");
  const { token: refreshToken } = generateToken({ id: userId, username: lowerUsername }, "7d", "refresh");

  // Trigger automated n8n signup notification
  sendNotification({
    type: "signup",
    name: username,
    email: lowerEmail
  });

  return res.status(201).json({
    success: true,
    accessToken,
    refreshToken,
    token: { accessToken, refreshToken },
    user: {
      student_id: userId,
      name: username,
      email: lowerEmail,
      phone: strippedPhone
    }
  });
});

// --- LOGIN ---

router.post("/login", authLimiter, (req, res) => {
  const { username, password } = req.body; // username can be username or email

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password are required." });
  }

  const query = username.toLowerCase().trim();

  // Find user by username or email
  const user = Array.from(usersStore.values()).find(
    (u) => u.username.toLowerCase() === query || u.email.toLowerCase() === query
  );

  // Generic credential error (never reveal which field was wrong)
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(400).json({ success: false, message: "Invalid credentials." });
  }

  // Generate tokens
  const { token: accessToken } = generateToken({ id: user.id, username: user.username }, "15m", "access");
  const { token: refreshToken } = generateToken({ id: user.id, username: user.username }, "7d", "refresh");

  // Trigger automated n8n login notification
  sendNotification({
    type: "login",
    name: user.username,
    email: user.email,
    time: new Date().toISOString().slice(0, 16),
    device: getDeviceString(req.headers["user-agent"])
  });

  return res.json({
    success: true,
    accessToken,
    refreshToken,
    token: { accessToken, refreshToken },
    user: {
      student_id: user.id,
      name: user.username,
      email: user.email,
      phone: user.phone
    }
  });
});

// --- REFRESH TOKEN ---

router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ success: false, message: "Refresh token is required." });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);

    if (decoded.type !== "refresh") {
      return res.status(400).json({ success: false, message: "Invalid token type. Refresh token required." });
    }

    if (blacklistedJtis.has(decoded.jti)) {
      return res.status(401).json({ success: false, message: "Refresh token has been revoked." });
    }

    // Blacklist the old refresh token to prevent reuse (optional token rotation)
    blacklistedJtis.add(decoded.jti);

    // Generate new access and refresh tokens
    const { token: newAccessToken } = generateToken({ id: decoded.id, username: decoded.username }, "15m", "access");
    const { token: newRefreshToken } = generateToken({ id: decoded.id, username: decoded.username }, "7d", "refresh");

    return res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      token: { accessToken: newAccessToken, refreshToken: newRefreshToken }
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Refresh token expired or invalid." });
  }
});

// --- LOGOUT ---

router.post("/logout", requireAuth, (req, res) => {
  // Retrieve tokens from headers and body to blacklist both
  const authHeader = req.headers.authorization;
  const accessToken = authHeader.split(" ")[1];
  const { refreshToken } = req.body;

  try {
    const decodedAccess = jwt.verify(accessToken, JWT_SECRET);
    blacklistedJtis.add(decodedAccess.jti);
  } catch (e) {}

  if (refreshToken) {
    try {
      const decodedRefresh = jwt.verify(refreshToken, JWT_SECRET);
      if (decodedRefresh.type === "refresh") {
        blacklistedJtis.add(decodedRefresh.jti);
      }
    } catch (e) {}
  }

  return res.json({ success: true, message: "Logged out successfully. Tokens revoked." });
});

// --- DELETE PROFILE ---

router.delete("/profile", requireAuth, (req, res) => {
  const { password } = req.body;
  const userId = req.user.id;

  if (!password) {
    return res.status(400).json({ success: false, message: "Password confirmation is required." });
  }

  const user = usersStore.get(userId);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(400).json({ success: false, message: "Password confirmation failed." });
  }

  // Revoke current access token
  const authHeader = req.headers.authorization;
  const accessToken = authHeader.split(" ")[1];
  try {
    const decodedAccess = jwt.verify(accessToken, JWT_SECRET);
    blacklistedJtis.add(decodedAccess.jti);
  } catch (e) {}

  // Delete user
  usersStore.delete(userId);
  console.log(`[AUTH profile] Deleted user profile: ${user.username}`);

  return res.json({ success: true, message: "User profile deleted successfully." });
});

// --- FORGOT PASSWORD FLOW (3 STEPS) ---

// Step 1: Request OTP
router.post("/forgot-password", otpLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Gmail address is required." });

  const lowerEmail = email.toLowerCase().trim();
  
  // Find user
  const user = Array.from(usersStore.values()).find((u) => u.email.toLowerCase() === lowerEmail);

  // Generic error (don't confirm existence to prevent enumeration)
  if (!user) {
    return res.status(400).json({ success: false, message: "If this email exists in our system, an OTP has been sent." });
  }

  // Generate secure 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now

  // Store OTP
  pendingOtps.set(lowerEmail, { otp, expiresAt, phone: user.phone });

  // Dispatch OTP
  await dispatchOtp(user.phone, lowerEmail, otp);

  // Trigger automated n8n forgot_password notification
  sendNotification({
    type: "forgot_password",
    email: lowerEmail,
    otp: otp
  });

  // Return masked phone to frontend
  const maskPhone = (phoneStr) => {
    const stripped = phoneStr.replace(/\D/g, "");
    if (stripped.length <= 4) return `+${stripped}`;
    const lastFour = stripped.slice(-4);
    const hidden = "•".repeat(Math.min(stripped.length - 4, 6));
    return `+${stripped.slice(0, stripped.length - lastFour.length - hidden.length)} ${hidden}${lastFour}`;
  };

  return res.json({
    success: true,
    message: "OTP sent successfully.",
    maskedPhone: maskPhone(user.phone)
  });
});

// Resend OTP
router.post("/resend-otp", otpLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Gmail address is required." });

  const lowerEmail = email.toLowerCase().trim();
  const pending = pendingOtps.get(lowerEmail);

  if (!pending) {
    return res.status(400).json({ success: false, message: "No active OTP request found for this email." });
  }

  // Regenerate OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  pendingOtps.set(lowerEmail, { otp, expiresAt, phone: pending.phone });

  await dispatchOtp(pending.phone, lowerEmail, otp);

  // Trigger automated n8n forgot_password notification for the resent OTP
  sendNotification({
    type: "forgot_password",
    email: lowerEmail,
    otp: otp
  });

  return res.json({ success: true, message: "OTP resent successfully." });
});

// Step 2: Verify OTP
router.post("/verify-otp", otpLimiter, (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP are required." });
  }

  const lowerEmail = email.toLowerCase().trim();
  const pending = pendingOtps.get(lowerEmail);

  if (!pending) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
  }

  if (Date.now() > pending.expiresAt) {
    pendingOtps.delete(lowerEmail);
    return res.status(400).json({ success: false, message: "OTP has expired." });
  }

  if (pending.otp !== otp.trim()) {
    return res.status(400).json({ success: false, message: "Invalid OTP." });
  }

  // Success: Clear OTP and issue a short-lived password reset token (10 min, type reset)
  pendingOtps.delete(lowerEmail);
  const { token: resetToken } = generateToken({ email: lowerEmail }, "10m", "reset");

  return res.json({
    success: true,
    message: "OTP verified successfully.",
    resetToken
  });
});

// Step 3: Reset Password
router.post("/reset-password", otpLimiter, (req, res) => {
  const { resetToken, newPassword } = req.body;

  if (!resetToken || !newPassword) {
    return res.status(400).json({ success: false, message: "Reset token and new password are required." });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
  }

  try {
    const decoded = jwt.verify(resetToken, JWT_SECRET);

    if (decoded.type !== "reset") {
      return res.status(400).json({ success: false, message: "Invalid token type. Reset token required." });
    }

    if (blacklistedJtis.has(decoded.jti)) {
      return res.status(401).json({ success: false, message: "Reset token has already been used/revoked." });
    }

    // Find user
    const user = Array.from(usersStore.values()).find((u) => u.email.toLowerCase() === decoded.email.toLowerCase());
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found." });
    }

    // Hash new password and update
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);
    
    user.passwordHash = passwordHash;
    console.log(`[AUTH reset-password] Reset password for user: ${user.username} (${user.email})`);

    // Blacklist the reset token to prevent double-use
    blacklistedJtis.add(decoded.jti);

    // Trigger automated n8n password_reset notification
    sendNotification({
      type: "password_reset",
      email: decoded.email
    });

    return res.json({ success: true, message: "Password reset successfully." });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Reset token expired or invalid." });
  }
});

module.exports = {
  router,
  requireAuth
};
