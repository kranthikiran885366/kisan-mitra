const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const auth = require("../middleware/auth");
const { v4: uuidv4 } = require("uuid");
const File = require("../models/File");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileType = file.mimetype.split("/")[0];
    let dest = uploadsDir;
    
    // Create subdirectories based on file type
    switch (fileType) {
      case "image":
        dest = path.join(uploadsDir, "images");
        break;
      case "video":
        dest = path.join(uploadsDir, "videos");
        break;
      case "application":
        dest = path.join(uploadsDir, "documents");
        break;
      default:
        dest = path.join(uploadsDir, "others");
    }
    
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter to allow only certain file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/quicktime",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images, videos, and documents are allowed."), false);
  }
};

// Initialize multer with configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Handle single file upload
router.post(
  "/",
  [
    auth,
    upload.single("file"),
    [
      body("purpose").optional().isString(),
      body("metadata").optional().isObject(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Clean up the uploaded file if validation fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
      }

      const { purpose, metadata = {} } = req.body;
      const { filename, path: filePath, mimetype, size } = req.file;
      
      // Get relative path for the URL
      const relativePath = path.relative(uploadsDir, filePath).replace(/\\/g, "/");
      const fileUrl = `/uploads/${relativePath}`;

      // Create file record in database
      const fileRecord = new File({
        originalName: req.file.originalname,
        fileName: filename,
        filePath: relativePath,
        fileUrl,
        mimeType: mimetype,
        size,
        purpose,
        metadata: {
          ...metadata,
          uploadedBy: req.userId,
        },
        createdBy: req.userId,
      });

      await fileRecord.save();

      res.status(201).json({
        success: true,
        data: fileRecord,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      
      // Clean up the uploaded file if there was an error
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          console.error("Error cleaning up file:", err);
        }
      }
      
      res.status(500).json({
        success: false,
        message: "Failed to upload file",
        error: error.message,
      });
    }
  }
);

// Handle multiple file uploads
router.post(
  "/multiple",
  [
    auth,
    upload.array("files", 10), // Max 10 files
    [
      body("purpose").optional().isString(),
      body("metadata").optional().isObject(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Clean up any uploaded files if validation fails
        if (req.files && req.files.length > 0) {
          req.files.forEach(file => {
            if (file.path) fs.unlinkSync(file.path);
          });
        }
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: "No files uploaded" });
      }

      const { purpose, metadata = {} } = req.body;
      const fileRecords = [];

      // Process each file
      for (const file of req.files) {
        const relativePath = path.relative(uploadsDir, file.path).replace(/\\/g, "/");
        const fileUrl = `/uploads/${relativePath}`;

        const fileRecord = new File({
          originalName: file.originalname,
          fileName: file.filename,
          filePath: relativePath,
          fileUrl,
          mimeType: file.mimetype,
          size: file.size,
          purpose,
          metadata: {
            ...metadata,
            uploadedBy: req.userId,
          },
          createdBy: req.userId,
        });

        await fileRecord.save();
        fileRecords.push(fileRecord);
      }

      res.status(201).json({
        success: true,
        data: fileRecords,
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      
      // Clean up any uploaded files if there was an error
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          if (file.path) {
            try {
              fs.unlinkSync(file.path);
            } catch (err) {
              console.error("Error cleaning up file:", err);
            }
          }
        });
      }
      
      res.status(500).json({
        success: false,
        message: "Failed to upload files",
        error: error.message,
      });
    }
  }
);

// Get file by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    // Check if user has permission to access this file
    if (file.createdBy.toString() !== req.userId && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to access this file" });
    }

    res.json({ success: true, data: file });
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).json({ success: false, message: "Failed to fetch file" });
  }
});

// Get files with filters
router.get("/", auth, async (req, res) => {
  try {
    const { purpose, mimeType, userId, page = 1, limit = 20 } = req.query;
    const query = {};

    if (purpose) query.purpose = purpose;
    if (mimeType) query.mimeType = new RegExp(mimeType, "i");
    
    // Non-admins can only see their own files or public files
    if (req.user.role !== "admin") {
      query.$or = [
        { createdBy: req.userId },
        { "metadata.isPublic": true }
      ];
    } else if (userId) {
      // Admin can filter by user
      query.createdBy = userId;
    }

    const [files, total] = await Promise.all([
      File.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate("createdBy", "name email"),
      File.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: files,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ success: false, message: "Failed to fetch files" });
  }
});

// Delete a file
router.delete("/:id", auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    // Check if user has permission to delete this file
    if (file.createdBy.toString() !== req.userId && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this file" });
    }

    // Delete the physical file
    const filePath = path.join(uploadsDir, file.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete the database record
    await File.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ success: false, message: "Failed to delete file" });
  }
});

// Serve uploaded files (public access)
router.get("/serve/:filename", async (req, res) => {
  try {
    const file = await File.findOne({ fileName: req.params.filename });
    
    if (!file) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    // Check if file is public or user has permission
    const isPublic = file.metadata?.isPublic;
    const isOwner = req.user && file.createdBy.toString() === req.userId;
    const isAdmin = req.user && req.user.role === "admin";
    
    if (!isPublic && !isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to access this file" });
    }

    const filePath = path.join(uploadsDir, file.filePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "File not found on server" });
    }

    // Set appropriate headers
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${file.originalName}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error serving file:", error);
    res.status(500).json({ success: false, message: "Failed to serve file" });
  }
});

// Update file metadata
router.patch(
  "/:id",
  [
    auth,
    [
      body("purpose").optional().isString(),
      body("metadata").optional().isObject(),
      body("isPublic").optional().isBoolean(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { purpose, metadata, isPublic } = req.body;
      const file = await File.findById(req.params.id);
      
      if (!file) {
        return res.status(404).json({ success: false, message: "File not found" });
      }

      // Check if user has permission to update this file
      if (file.createdBy.toString() !== req.userId && req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Not authorized to update this file" });
      }

      // Update fields
      if (purpose !== undefined) file.purpose = purpose;
      if (metadata !== undefined) file.metadata = { ...file.metadata, ...metadata };
      if (isPublic !== undefined) {
        file.metadata = file.metadata || {};
        file.metadata.isPublic = isPublic;
      }

      await file.save();
      
      res.json({ success: true, data: file });
    } catch (error) {
      console.error("Error updating file:", error);
      res.status(500).json({ success: false, message: "Failed to update file" });
    }
  }
);

module.exports = router;
