const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const prescriptionSchema = new Schema({
  diagnosis: {
    type: String,
    required: true,
    trim: true,
  },
  recommendations: [{
    type: String,
    trim: true,
  }],
  prescribedMedicines: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dosage: {
      type: String,
      required: true,
      trim: true,
    },
    frequency: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  }],
  followUpDate: {
    type: Date,
  },
  additionalNotes: {
    type: String,
    trim: true,
  },
  prescribedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  prescribedAt: {
    type: Date,
    default: Date.now,
  },
});

const consultationSchema = new Schema(
  {
    farmer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cropType: {
      type: String,
      required: true,
      trim: true,
    },
    cropVariety: {
      type: String,
      trim: true,
    },
    cropStage: {
      type: String,
      trim: true,
    },
    symptoms: [{
      type: String,
      trim: true,
    }],
    description: {
      type: String,
      trim: true,
    },
    images: [{
      url: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        trim: true,
      },
    }],
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: {
        type: String,
        trim: true,
      },
    },
    urgency: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    prescription: {
      type: prescriptionSchema,
    },
    consultationNotes: [{
      note: {
        type: String,
        required: true,
      },
      addedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    rating: {
      score: {
        type: Number,
        min: 1,
        max: 5,
      },
      feedback: {
        type: String,
        trim: true,
      },
      submittedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
consultationSchema.index({ farmer: 1 });
consultationSchema.index({ doctor: 1 });
consultationSchema.index({ status: 1 });
consultationSchema.index({ cropType: 1 });
consultationSchema.index({ "location.coordinates": "2dsphere" });

// Virtual for consultation duration
consultationSchema.virtual("duration").get(function () {
  if (this.status !== "completed" || !this.updatedAt || !this.createdAt) {
    return null;
  }
  return this.updatedAt - this.createdAt;
});

// Method to add a consultation note
consultationSchema.methods.addNote = function (note, userId) {
  this.consultationNotes.push({
    note,
    addedBy: userId,
  });
  return this.save();
};

// Static method to find consultations by status
consultationSchema.statics.findByStatus = function (status, page = 1, limit = 10) {
  return this.find({ status })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("farmer", "name email phone")
    .populate("doctor", "name email phone");
};

// Static method to find nearby consultations
consultationSchema.statics.findNearby = function (coordinates, maxDistance = 10000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates,
        },
        $maxDistance: maxDistance,
      },
    },
    status: "pending",
  })
    .sort({ urgency: -1, createdAt: 1 })
    .populate("farmer", "name phone");
};

// Pre-save hook to validate data
consultationSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "completed" && !this.prescription) {
    throw new Error("Cannot complete consultation without a prescription");
  }
  next();
});

// Post-save hook to send notifications
consultationSchema.post("save", async function (doc) {
  // Implementation for sending notifications would go here
  console.log(`Consultation ${doc._id} saved with status: ${doc.status}`);
});

module.exports = mongoose.model("Consultation", consultationSchema);
