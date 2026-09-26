const mongoose = require("mongoose")

const roadmapProgressSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
      trim: true
    },

    completedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    _id: false
  }
)


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["developer", "creator"],
      required: true
    },

    bio: {
      type: String,
      default: "",
      trim: true
    },

    skills: {
      type: String,
      default: "",
      trim: true
    },

    github: {
      type: String,
      default: "",
      trim: true
    },

    linkedin: {
      type: String,
      default: "",
      trim: true
    },


    // =========================
    // SAVED PROJECTS
    // =========================

    savedProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
      }
    ],


    // =========================
    // ROADMAP PROGRESS
    // =========================

    completedRoadmapTopics: {
      type: [String],
      default: []
    },

    roadmapProgress: {
      type: [roadmapProgressSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
)


module.exports = mongoose.model(
  "User",
  userSchema
)