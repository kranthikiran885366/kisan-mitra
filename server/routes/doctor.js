const express = require("express");
const Consultation = require("../models/Consultation");
const auth = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// Request a new consultation
router.post(
  "/consultations",
  [
    auth,
    [
      body("cropType").trim().notEmpty(),
      body("symptoms").isArray().notEmpty(),
      body("images").optional().isArray(),
      body("urgency").isIn(["low", "medium", "high"])
    ]
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { cropType, symptoms, images, urgency } = req.body;
      
      const consultation = new Consultation({
        farmer: req.userId,
        cropType,
        symptoms,
        images: images || [],
        urgency,
        status: "pending"
      });

      await consultation.save();
      res.status(201).json({ success: true, data: consultation });
    } catch (error) {
      console.error("Error creating consultation:", error);
      res.status(500).json({ success: false, message: "Failed to create consultation" });
    }
  }
);

// Get all consultations (for farmers and doctors)
router.get("/consultations", auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = req.user.role === "doctor" ? {} : { farmer: req.userId };
    
    if (status) query.status = status;

    const [consultations, total] = await Promise.all([
      Consultation.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate("farmer doctor", "name profilePicture"),
      Consultation.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: consultations,
      pagination: { 
        page: Number(page), 
        limit: Number(limit), 
        total, 
        pages: Math.ceil(total / limit) 
      }
    });
  } catch (error) {
    console.error("Error fetching consultations:", error);
    res.status(500).json({ success: false, message: "Failed to fetch consultations" });
  }
});

// Doctor accepts a consultation
router.post(
  "/consultations/:id/accept",
  [auth, body("diagnosis").trim().notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      if (req.user.role !== "doctor") {
        return res.status(403).json({ success: false, message: "Only doctors can accept consultations" });
      }

      const consultation = await Consultation.findOneAndUpdate(
        { _id: req.params.id, status: "pending" },
        {
          $set: {
            doctor: req.userId,
            status: "in_progress",
            diagnosis: req.body.diagnosis,
            acceptedAt: new Date()
          }
        },
        { new: true }
      );

      if (!consultation) {
        return res.status(404).json({ success: false, message: "No pending consultation found" });
      }

      res.json({ success: true, data: consultation });
    } catch (error) {
      console.error("Error accepting consultation:", error);
      res.status(500).json({ success: false, message: "Failed to accept consultation" });
    }
  }
);

// Update consultation status
router.patch(
  "/consultations/:id/status",
  [auth, body("status").isIn(["completed", "cancelled"])],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const update = { status: req.body.status };
      if (req.body.status === "completed") update.completedAt = new Date();
      if (req.body.status === "cancelled") update.cancelledAt = new Date();

      const consultation = await Consultation.findOneAndUpdate(
        { _id: req.params.id, $or: [{ farmer: req.userId }, { doctor: req.userId }] },
        { $set: update },
        { new: true }
      );

      if (!consultation) {
        return res.status(404).json({ success: false, message: "Consultation not found or not authorized" });
      }

      res.json({ success: true, data: consultation });
    } catch (error) {
      console.error("Error updating consultation status:", error);
      res.status(500).json({ success: false, message: "Failed to update consultation status" });
    }
  }
);

// Add prescription to consultation
router.post(
  "/consultations/:id/prescription",
  [
    auth,
    [
      body("medicines").isArray().notEmpty(),
      body("instructions").trim().notEmpty()
    ]
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const consultation = await Consultation.findOneAndUpdate(
        { _id: req.params.id, doctor: req.userId, status: "in_progress" },
        {
          $set: {
            prescription: {
              medicines: req.body.medicines,
              instructions: req.body.instructions,
              prescribedAt: new Date()
            }
          }
        },
        { new: true }
      );

      if (!consultation) {
        return res.status(404).json({ success: false, message: "Consultation not found or not authorized" });
      }

      res.json({ success: true, data: consultation });
    } catch (error) {
      console.error("Error adding prescription:", error);
      res.status(500).json({ success: false, message: "Failed to add prescription" });
    }
  }
);

module.exports = router;
