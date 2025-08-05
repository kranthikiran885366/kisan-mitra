const express = require("express");
const twilio = require("twilio");
const auth = require("../middleware/auth");
const { body, validationResult } = require("express-validator");
const Farmer = require("../models/Farmer");
const MessageTemplate = require("../models/MessageTemplate");
const MessageLog = require("../models/MessageLog");

const router = express.Router();

// Initialize Twilio client if credentials are available
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = accountSid && authToken ? twilio(accountSid, authToken) : null;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886"; // Sandbox number as fallback

// Check if WhatsApp service is available
const isWhatsAppEnabled = () => {
  if (!twilioClient) {
    console.warn("WhatsApp service is disabled. TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required.");
    return false;
  }
  return true;
};

// Send a WhatsApp message
router.post(
  "/send",
  [
    auth,
    [
      body("to").isMobilePhone().withMessage("Invalid phone number"),
      body("message").trim().notEmpty().withMessage("Message cannot be empty"),
    ],
  ],
  async (req, res) => {
    try {
      if (!isWhatsAppEnabled()) {
        return res.status(503).json({ success: false, message: "WhatsApp service is not configured" });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { to, message } = req.body;
      const from = `whatsapp:${whatsappNumber.replace(/[^0-9+]/g, "")}`;
      const toFormatted = to.startsWith("whatsapp:") ? to : `whatsapp:${to.replace(/[^0-9+]/g, "")}`;

      // Check if user has permission to send messages (admin or the message is to themselves)
      const isAdmin = req.user.role === "admin";
      const isSelf = toFormatted === `whatsapp:${req.user.phone}`;
      
      if (!isAdmin && !isSelf) {
        return res.status(403).json({ success: false, message: "Not authorized to send messages to this number" });
      }

      // Send message via Twilio
      const twilioMessage = await twilioClient.messages.create({
        body: message,
        from,
        to: toFormatted,
      });

      // Log the message
      const messageLog = new MessageLog({
        from: req.userId,
        to: toFormatted,
        message,
        twilioSid: twilioMessage.sid,
        status: twilioMessage.status,
        direction: "outbound",
      });

      await messageLog.save();

      res.json({
        success: true,
        message: "Message sent successfully",
        sid: twilioMessage.sid,
        status: twilioMessage.status,
      });
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      
      // Log the error
      const errorLog = new MessageLog({
        from: req.userId,
        to: req.body.to,
        message: req.body.message,
        status: "failed",
        error: error.message,
        direction: "outbound",
      });
      await errorLog.save();
      
      res.status(500).json({
        success: false,
        message: "Failed to send WhatsApp message",
        error: error.message,
      });
    }
  }
);

// Webhook for incoming WhatsApp messages
router.post("/webhook", async (req, res) => {
  try {
    if (!isWhatsAppEnabled()) {
      console.warn("Received webhook but WhatsApp service is disabled");
      return res.sendStatus(200); // Still return 200 to prevent retries
    }

    const { From, Body, To, MessageSid } = req.body;
    
    // Log the incoming message
    const messageLog = new MessageLog({
      from: From,
      to: To,
      message: Body,
      twilioSid: MessageSid,
      status: "received",
      direction: "inbound",
      rawData: req.body,
    });

    await messageLog.save();

    // Auto-respond if needed
    const autoResponses = {
      "hi": "Hello! How can I help you today?",
      "hello": "Hi there! How can I assist you?",
      "help": "Here are some things you can do:\n- Check weather\n- Get crop advice\n- Talk to an expert\n- View market prices",
    };

    const lowerBody = Body.trim().toLowerCase();
    const response = autoResponses[lowerBody] || 
      "Thank you for your message. Our team will get back to you shortly.";

    // Send auto-response
    if (autoResponses[lowerBody]) {
      await twilioClient.messages.create({
        body: response,
        from: To,
        to: From,
      });
    }

    // Process the message further (e.g., forward to support, trigger workflows, etc.)
    // This would be implemented based on your specific requirements

    res.sendStatus(200);
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.sendStatus(500);
  }
});

// Get message history
router.get("/history", auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, direction } = req.query;
    const query = { 
      $or: [
        { from: req.user.phone },
        { to: req.user.phone },
        { from: req.user._id },
        { to: req.user._id },
      ]
    };

    if (direction) {
      query.direction = direction;
    }

    const [messages, total] = await Promise.all([
      MessageLog.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      MessageLog.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: messages,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching message history:", error);
    res.status(500).json({ success: false, message: "Failed to fetch message history" });
  }
});

// Create a message template (admin only)
router.post(
  "/templates",
  [
    auth,
    [
      body("name").trim().notEmpty(),
      body("content").trim().notEmpty(),
      body("variables").optional().isArray(),
      body("category").optional().trim(),
    ],
  ],
  async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Only admins can create templates" });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const template = new MessageTemplate({
        ...req.body,
        createdBy: req.userId,
      });

      await template.save();
      res.status(201).json({ success: true, data: template });
    } catch (error) {
      console.error("Error creating message template:", error);
      res.status(500).json({ success: false, message: "Failed to create template" });
    }
  }
);

// Get message templates
router.get("/templates", auth, async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    // Non-admins can only see approved templates
    if (req.user.role !== "admin") {
      query.status = "approved";
    }

    const [templates, total] = await Promise.all([
      MessageTemplate.find(query)
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate("createdBy", "name"),
      MessageTemplate.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: templates,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ success: false, message: "Failed to fetch templates" });
  }
});

// Send a message using a template
router.post(
  "/send-template",
  [
    auth,
    [
      body("templateId").isMongoId(),
      body("to").isMobilePhone(),
      body("variables").optional().isObject(),
    ],
  ],
  async (req, res) => {
    try {
      if (!isWhatsAppEnabled()) {
        return res.status(503).json({ success: false, message: "WhatsApp service is not configured" });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { templateId, to, variables = {} } = req.body;
      
      // Get the template
      const template = await MessageTemplate.findById(templateId);
      if (!template) {
        return res.status(404).json({ success: false, message: "Template not found" });
      }

      // Replace variables in the template
      let message = template.content;
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        message = message.replace(regex, value);
      });

      // Send the message
      const from = `whatsapp:${whatsappNumber.replace(/[^0-9+]/g, "")}`;
      const toFormatted = to.startsWith("whatsapp:") ? to : `whatsapp:${to.replace(/[^0-9+]/g, "")}`;

      const twilioMessage = await twilioClient.messages.create({
        body: message,
        from,
        to: toFormatted,
      });

      // Log the message
      const messageLog = new MessageLog({
        from: req.userId,
        to: toFormatted,
        message,
        template: templateId,
        twilioSid: twilioMessage.sid,
        status: twilioMessage.status,
        direction: "outbound",
        variables,
      });

      await messageLog.save();

      res.json({
        success: true,
        message: "Message sent successfully",
        sid: twilioMessage.sid,
        status: twilioMessage.status,
      });
    } catch (error) {
      console.error("Error sending template message:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send template message",
        error: error.message,
      });
    }
  }
);

module.exports = router;
