const express = require("express");
const Video = require("../models/Video");
const auth = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// Upload a new video (admin only)
router.post(
  "/",
  [
    auth,
    [
      body("title").trim().isLength({ min: 5 }),
      body("description").trim().isLength({ min: 10 }),
      body("url").isURL(),
      body("duration").isInt({ min: 1 }),
      body("categories").isArray().notEmpty(),
      body("language").isIn(["hindi", "english", "tamil", "telugu", "kannada", "malayalam", "bengali", "marathi", "gujarati", "punjabi"]),
      body("level").isIn(["beginner", "intermediate", "advanced"]),
    ],
  ],
  async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Only admins can upload videos" });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const video = new Video({
        ...req.body,
        uploadedBy: req.userId,
      });

      await video.save();
      res.status(201).json({ success: true, data: video });
    } catch (error) {
      console.error("Error uploading video:", error);
      res.status(500).json({ success: false, message: "Failed to upload video" });
    }
  }
);

// Get all videos with filters
router.get("/", auth, async (req, res) => {
  try {
    const { category, language, level, search, page = 1, limit = 10 } = req.query;
    const query = { isPublished: true };

    if (category) query.categories = category;
    if (language) query.language = language;
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const [videos, total] = await Promise.all([
      Video.find(query)
        .sort({ createdAt: -1, viewCount: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate("uploadedBy", "name profilePicture"),
      Video.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: videos,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ success: false, message: "Failed to fetch videos" });
  }
});

// Get video by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    ).populate("uploadedBy", "name profilePicture");

    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found" });
    }

    // Get related videos (same category, excluding current video)
    const relatedVideos = await Video.find({
      _id: { $ne: video._id },
      categories: { $in: video.categories },
      isPublished: true,
    })
      .limit(4)
      .select("title thumbnailUrl viewCount duration");

    res.json({
      success: true,
      data: {
        ...video.toObject(),
        relatedVideos,
      },
    });
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).json({ success: false, message: "Failed to fetch video" });
  }
});

// Add video to watch later
router.post("/:id/watch-later", auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $addToSet: { watchLater: req.params.id } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Added to watch later" });
  } catch (error) {
    console.error("Error adding to watch later:", error);
    res.status(500).json({ success: false, message: "Failed to add to watch later" });
  }
});

// Rate a video
router.post(
  "/:id/rate",
  [auth, [body("rating").isInt({ min: 1, max: 5 })]],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const video = await Video.findById(req.params.id);
      if (!video) {
        return res.status(404).json({ success: false, message: "Video not found" });
      }

      // Check if user already rated
      const existingRating = video.ratings.find(
        (r) => r.user.toString() === req.userId
      );

      if (existingRating) {
        // Update existing rating
        existingRating.rating = req.body.rating;
      } else {
        // Add new rating
        video.ratings.push({
          user: req.userId,
          rating: req.body.rating,
        });
      }

      // Calculate new average rating
      const totalRatings = video.ratings.reduce((sum, r) => sum + r.rating, 0);
      video.averageRating = totalRatings / video.ratings.length;
      video.ratingCount = video.ratings.length;

      await video.save();
      res.json({ success: true, data: { averageRating: video.averageRating } });
    } catch (error) {
      console.error("Error rating video:", error);
      res.status(500).json({ success: false, message: "Failed to rate video" });
    }
  }
);

// Add a comment to video
router.post(
  "/:id/comments",
  [auth, [body("text").trim().isLength({ min: 1, max: 1000 })]],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const video = await Video.findById(req.params.id);
      if (!video) {
        return res.status(404).json({ success: false, message: "Video not found" });
      }

      const comment = {
        user: req.userId,
        text: req.body.text,
        likes: [],
        replies: [],
      };

      video.comments.push(comment);
      await video.save();

      // Populate user details for the response
      const populatedComment = {
        ...comment.toObject(),
        user: {
          _id: req.userId,
          name: req.user.name,
          profilePicture: req.user.profilePicture,
        },
      };

      res.status(201).json({ success: true, data: populatedComment });
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ success: false, message: "Failed to add comment" });
    }
  }
);

// Get video analytics (admin only)
router.get("/analytics/trending", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admins can view analytics" });
    }

    const { days = 30, limit = 10 } = req.query;
    const date = new Date();
    date.setDate(date.getDate() - Number(days));

    const trendingVideos = await Video.aggregate([
      { $match: { createdAt: { $gte: date } } },
      { $sort: { viewCount: -1 } },
      { $limit: Number(limit) },
      {
        $lookup: {
          from: "users",
          localField: "uploadedBy",
          foreignField: "_id",
          as: "uploadedBy",
        },
      },
      { $unwind: "$uploadedBy" },
      {
        $project: {
          title: 1,
          viewCount: 1,
          duration: 1,
          thumbnailUrl: 1,
          "uploadedBy.name": 1,
          "uploadedBy.profilePicture": 1,
        },
      },
    ]);

    res.json({ success: true, data: trendingVideos });
  } catch (error) {
    console.error("Error fetching video analytics:", error);
    res.status(500).json({ success: false, message: "Failed to fetch video analytics" });
  }
});

module.exports = router;
