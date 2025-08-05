const express = require("express");
const Expert = require("../models/Expert");
const Appointment = require("../models/Appointment");
const auth = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// Register as an expert
router.post(
  "/register",
  [
    auth,
    [
      body("specialization").isArray().notEmpty(),
      body("experience").isInt({ min: 0 }),
      body("hourlyRate").isFloat({ min: 0 }),
      body("bio").trim().isLength({ min: 50 }),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const expert = new Expert({
        user: req.userId,
        ...req.body,
        status: "pending"
      });

      await expert.save();
      await expert.populate("user", "name email profilePicture");
      res.status(201).json({ success: true, data: expert });
    } catch (error) {
      console.error("Error registering expert:", error);
      res.status(500).json({ success: false, message: "Failed to register as expert" });
    }
  }
);

// Get all experts with filters
router.get("/", auth, async (req, res) => {
  try {
    const { specialization, minRating, page = 1, limit = 10 } = req.query;
    const query = { status: "approved" };

    if (specialization) query.specialization = { $in: [specialization].flat() };
    if (minRating) query.rating = { $gte: Number(minRating) };

    const [experts, total] = await Promise.all([
      Expert.find(query)
        .populate("user", "name profilePicture")
        .sort({ rating: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Expert.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: experts,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error("Error fetching experts:", error);
    res.status(500).json({ success: false, message: "Failed to fetch experts" });
  }
});

// Book an appointment
router.post(
  "/:expertId/appointments",
  [auth, [body("dateTime").isISO8601(), body("duration").isInt({ min: 15, max: 120 })]],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { dateTime, duration } = req.body;
      const expert = await Expert.findOne({ _id: req.params.expertId, status: "approved" });
      if (!expert) return res.status(404).json({ success: false, message: "Expert not found" });

      const appointment = new Appointment({
        expert: expert._id,
        user: req.userId,
        dateTime: new Date(dateTime),
        duration,
        status: "pending",
        cost: (duration / 60) * expert.hourlyRate,
      });

      await appointment.save();
      res.status(201).json({ success: true, data: appointment });
    } catch (error) {
      console.error("Error booking appointment:", error);
      res.status(500).json({ success: false, message: "Failed to book appointment" });
    }
  }
);

module.exports = router;
