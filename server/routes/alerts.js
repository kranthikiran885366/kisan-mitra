const express = require("express");
const Alert = require("../models/Alert");
const Farmer = require("../models/Farmer");
const auth = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// Create a new alert (admin only)
router.post(
  "/",
  [
    auth,
    [
      body("title").trim().isLength({ min: 5 }),
      body("message").trim().isLength({ min: 10 }),
      body("severity").isIn(["low", "medium", "high", "critical"]),
      body("alertType").isIn(["weather", "pest", "disease", "market", "government", "general"]),
      body("targetStates").optional().isArray(),
      body("targetDistricts").optional().isArray(),
      body("expiryDate").optional().isISO8601(),
    ],
  ],
  async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Only admins can create alerts" });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const alert = new Alert({
        ...req.body,
        createdBy: req.userId,
        status: "active",
      });

      await alert.save();
      
      // In a real app, you would send push notifications to targeted users here
      
      res.status(201).json({ success: true, data: alert });
    } catch (error) {
      console.error("Error creating alert:", error);
      res.status(500).json({ success: false, message: "Failed to create alert" });
    }
  }
);

// Get alerts for the current user
router.get("/my-alerts", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, read, alertType } = req.query;
    
    // Get user's location
    const user = await Farmer.findById(req.userId).select("state district crops");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Build query
    const query = {
      $or: [
        { targetStates: { $in: [user.state, "all"] } },
        { targetDistricts: { $in: [user.district] } },
        { targetCrops: { $in: user.crops || [] } },
      ],
      status: "active",
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: { $gt: new Date() } },
      ],
    };

    if (read === "true" || read === "false") {
      query["readBy.user"] = read === "true" ? req.userId : { $ne: req.userId };
    }
    
    if (alertType) {
      query.alertType = alertType;
    }

    const [alerts, total] = await Promise.all([
      Alert.find(query)
        .sort({ createdAt: -1, severity: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate("createdBy", "name profilePicture"),
      Alert.countDocuments(query),
    ]);

    // Mark alerts as read when fetched
    if (read === "false") {
      await Alert.updateMany(
        { _id: { $in: alerts.map(a => a._id) }, "readBy.user": { $ne: req.userId } },
        { $push: { readBy: { user: req.userId, readAt: new Date() } } }
      );
    }

    res.json({
      success: true,
      data: alerts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ success: false, message: "Failed to fetch alerts" });
  }
});

// Get unread alert count
router.get("/unread-count", auth, async (req, res) => {
  try {
    const user = await Farmer.findById(req.userId).select("state district");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const query = {
      $or: [
        { targetStates: { $in: [user.state, "all"] } },
        { targetDistricts: { $in: [user.district] } },
      ],
      status: "active",
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: { $gt: new Date() } },
      ],
      "readBy.user": { $ne: req.userId },
    };

    const count = await Alert.countDocuments(query);
    res.json({ success: true, count });
  } catch (error) {
    console.error("Error counting unread alerts:", error);
    res.status(500).json({ success: false, message: "Failed to count unread alerts" });
  }
});

// Mark alert as read
router.post("/:alertId/read", auth, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.alertId,
      {
        $addToSet: {
          readBy: { user: req.userId, readAt: new Date() },
        },
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ success: false, message: "Alert not found" });
    }

    res.json({ success: true, message: "Alert marked as read" });
  } catch (error) {
    console.error("Error marking alert as read:", error);
    res.status(500).json({ success: false, message: "Failed to mark alert as read" });
  }
});

// Get alert statistics (admin only)
router.get("/statistics", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admins can view statistics" });
    }

    const { days = 30 } = req.query;
    const date = new Date();
    date.setDate(date.getDate() - Number(days));

    const stats = await Alert.aggregate([
      {
        $match: {
          createdAt: { $gte: date },
        },
      },
      {
        $group: {
          _id: "$alertType",
          count: { $sum: 1 },
          avgSeverity: { $avg: { $switch: {
            branches: [
              { case: { $eq: ["$severity", "low"] }, then: 1 },
              { case: { $eq: ["$severity", "medium"] }, then: 2 },
              { case: { $eq: ["$severity", "high"] }, then: 3 },
              { case: { $eq: ["$severity", "critical"] }, then: 4 },
            ],
            default: 0
          } } },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get read rates
    const readRates = await Alert.aggregate([
      {
        $project: {
          alertType: 1,
          readCount: { $size: "$readBy" },
        },
      },
      {
        $group: {
          _id: "$alertType",
          totalReads: { $sum: "$readCount" },
          totalAlerts: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 1,
          readRate: { $divide: ["$totalReads", "$totalAlerts"] },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        stats,
        readRates,
      },
    });
  } catch (error) {
    console.error("Error fetching alert statistics:", error);
    res.status(500).json({ success: false, message: "Failed to fetch alert statistics" });
  }
});

// Subscribe to alert types
router.post(
  "/subscribe",
  [auth, [body("alertTypes").isArray().notEmpty()]],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const user = await Farmer.findByIdAndUpdate(
        req.userId,
        { $addToSet: { notificationPreferences: { $each: req.body.alertTypes } } },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      res.json({ success: true, message: "Subscription updated successfully" });
    } catch (error) {
      console.error("Error updating alert subscriptions:", error);
      res.status(500).json({ success: false, message: "Failed to update subscriptions" });
    }
  }
);

// Unsubscribe from alert types
router.post(
  "/unsubscribe",
  [auth, [body("alertTypes").isArray().notEmpty()]],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const user = await Farmer.findByIdAndUpdate(
        req.userId,
        { $pull: { notificationPreferences: { $in: req.body.alertTypes } } },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      res.json({ success: true, message: "Unsubscribed successfully" });
    } catch (error) {
      console.error("Error unsubscribing from alerts:", error);
      res.status(500).json({ success: false, message: "Failed to unsubscribe" });
    }
  }
);

module.exports = router;
