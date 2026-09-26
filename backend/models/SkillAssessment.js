const mongoose = require("mongoose")

const skillAssessmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    skill: {
      type: String,
      required: true,
      trim: true
    },

    score: {
      type: Number,
      required: true,
      min: 0
    },

    totalQuestions: {
      type: Number,
      required: true,
      min: 1
    },

    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    level: {
      type: String,
      enum: [
        "Beginner",
        "Intermediate",
        "Advanced"
      ],
      required: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model(
  "SkillAssessment",
  skillAssessmentSchema
)