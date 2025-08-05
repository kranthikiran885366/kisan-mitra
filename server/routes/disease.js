const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const auth = require("../middleware/auth");
const DiseaseDetection = require("../models/DiseaseDetection");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/diseases");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `disease-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Mock AI disease detection (replace with actual AI service)
const detectDisease = async (imagePath) => {
  const diseases = [
    {
      name: "Late Blight",
      confidence: 92,
      severity: "high",
      crop: "Potato",
      description: "A serious fungal disease affecting potato crops",
      symptoms: ["Dark spots on leaves", "White fungal growth", "Stem rot"],
      treatments: {
        organic: ["Copper-based fungicides", "Proper drainage", "Crop rotation"],
        chemical: ["Metalaxyl", "Chlorothalonil", "Propamocarb"],
        cultural: ["Remove infected plants", "Improve air circulation", "Avoid overhead watering"]
      },
      prevention: ["Use resistant varieties", "Maintain proper spacing", "Monitor weather conditions"],
      weatherImpact: "High humidity and moderate temperatures (15-20°C) favor disease development"
    },
    {
      name: "Aphid Infestation",
      confidence: 87,
      severity: "medium",
      crop: "Wheat",
      description: "Small insects that suck plant sap",
      symptoms: ["Curled leaves", "Sticky honeydew", "Yellowing"],
      treatments: {
        organic: ["Neem oil", "Ladybug release", "Soap spray"],
        chemical: ["Imidacloprid", "Thiamethoxam", "Acetamiprid"],
        cultural: ["Reflective mulch", "Companion planting", "Remove weeds"]
      },
      prevention: ["Regular monitoring", "Beneficial insects", "Healthy soil"],
      weatherImpact: "Warm, dry conditions promote rapid reproduction"
    }
  ];
  
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return diseases[Math.floor(Math.random() * diseases.length)];
};

// Upload and analyze crop image
router.post("/analyze", [auth, upload.single("image")], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded"
      });
    }

    const { cropType, location } = req.body;
    
    // Perform AI disease detection
    const detectionResult = await detectDisease(req.file.path);
    
    // Save detection to database
    const detection = new DiseaseDetection({
      farmer: req.userId,
      imagePath: req.file.path,
      imageUrl: `/uploads/diseases/${req.file.filename}`,
      cropType: cropType || detectionResult.crop,
      location,
      detectionResult,
      status: "completed"
    });

    await detection.save();

    res.json({
      success: true,
      data: {
        id: detection._id,
        ...detectionResult,
        imageUrl: detection.imageUrl,
        timestamp: detection.createdAt
      }
    });
  } catch (error) {
    console.error("Disease detection error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to analyze image"
    });
  }
});

// Get user's detection history
router.get("/history", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, severity, crop } = req.query;
    
    const query = { farmer: req.userId };
    if (severity) query["detectionResult.severity"] = severity;
    if (crop) query.cropType = new RegExp(crop, "i");

    const [detections, total] = await Promise.all([
      DiseaseDetection.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .select("-imagePath"),
      DiseaseDetection.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: detections,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching detection history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch detection history"
    });
  }
});

// Get detection statistics
router.get("/stats", auth, async (req, res) => {
  try {
    const stats = await DiseaseDetection.aggregate([
      { $match: { farmer: req.userId } },
      {
        $group: {
          _id: "$detectionResult.severity",
          count: { $sum: 1 }
        }
      }
    ]);

    const totalScans = await DiseaseDetection.countDocuments({ farmer: req.userId });
    
    const severityStats = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    stats.forEach(stat => {
      if (stat._id) severityStats[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        totalScans,
        severityBreakdown: severityStats,
        recentScans: await DiseaseDetection.find({ farmer: req.userId })
          .sort({ createdAt: -1 })
          .limit(5)
          .select("cropType detectionResult.name detectionResult.severity createdAt imageUrl")
      }
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics"
    });
  }
});

// Get trending diseases
router.get("/trending", async (req, res) => {
  try {
    const trending = await DiseaseDetection.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        }
      },
      {
        $group: {
          _id: {
            disease: "$detectionResult.name",
            crop: "$cropType"
          },
          count: { $sum: 1 },
          severity: { $first: "$detectionResult.severity" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: trending.map(item => ({
        disease: item._id.disease,
        crop: item._id.crop,
        cases: item.count,
        severity: item.severity,
        trend: "up" // Simplified - could calculate actual trend
      }))
    });
  } catch (error) {
    console.error("Error fetching trending diseases:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trending diseases"
    });
  }
});

// Toggle favorite status
router.patch("/:id/favorite", auth, async (req, res) => {
  try {
    const detection = await DiseaseDetection.findOne({
      _id: req.params.id,
      farmer: req.userId
    });

    if (!detection) {
      return res.status(404).json({
        success: false,
        message: "Detection not found"
      });
    }

    detection.isFavorite = !detection.isFavorite;
    await detection.save();

    res.json({
      success: true,
      data: {
        id: detection._id,
        isFavorite: detection.isFavorite
      }
    });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle favorite"
    });
  }
});

// Disease database search
router.get("/database", async (req, res) => {
  try {
    const { search, crop, severity } = req.query;
    
    // Mock disease database (replace with actual database)
    const diseases = [
      {
        id: 1,
        name: "Late Blight",
        crop: "Potato",
        severity: "high",
        description: "A serious fungal disease affecting potato crops",
        symptoms: ["Dark spots on leaves", "White fungal growth", "Stem rot"],
        treatments: {
          organic: ["Copper-based fungicides", "Proper drainage", "Crop rotation"],
          chemical: ["Metalaxyl", "Chlorothalonil", "Propamocarb"],
          cultural: ["Remove infected plants", "Improve air circulation", "Avoid overhead watering"]
        },
        prevention: ["Use resistant varieties", "Maintain proper spacing", "Monitor weather conditions"]
      },
      {
        id: 2,
        name: "Aphid Infestation",
        crop: "Wheat",
        severity: "medium",
        description: "Small insects that suck plant sap",
        symptoms: ["Curled leaves", "Sticky honeydew", "Yellowing"],
        treatments: {
          organic: ["Neem oil", "Ladybug release", "Soap spray"],
          chemical: ["Imidacloprid", "Thiamethoxam", "Acetamiprid"],
          cultural: ["Reflective mulch", "Companion planting", "Remove weeds"]
        },
        prevention: ["Regular monitoring", "Beneficial insects", "Healthy soil"]
      }
    ];

    let filtered = diseases;
    
    if (search) {
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.crop.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (crop && crop !== "All") {
      filtered = filtered.filter(d => d.crop === crop);
    }
    
    if (severity) {
      filtered = filtered.filter(d => d.severity === severity);
    }

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error("Error searching disease database:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search disease database"
    });
  }
});

module.exports = router;