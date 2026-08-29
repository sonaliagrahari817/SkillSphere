const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    text: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    tech: {
      type: String,
      default: "",
      trim: true
    },

    github: {
      type: String,
      default: "",
      trim: true
    },

    liveDemo: {
      type: String,
      default: "",
      trim: true
    },

    image: {
      type: String,
      default: ""
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    likes: {
      type: Number,
      default: 0
    },

    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    comments: {
      type: [commentSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model(
  "Project",
  projectSchema
)