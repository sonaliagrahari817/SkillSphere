const User = require("../models/User")
const express = require("express")
const Project = require("../models/Project")
const protect = require("../middleware/authMiddleware")
const multer = require("multer")
const cloudinary = require("cloudinary").v2
const streamifier = require("streamifier")

const router = express.Router()

// =========================
// CLOUDINARY CONFIG
// =========================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// =========================
// MULTER MEMORY STORAGE
// =========================

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
})

// =========================
// UPLOAD IMAGE TO CLOUDINARY
// =========================

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "skillsphere/projects"
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      }
    )

    streamifier
      .createReadStream(file.buffer)
      .pipe(stream)
  })
}

// =========================
// CREATE A PROJECT
// =========================

router.post(
  "/",
  protect,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        tech,
        github,
        liveDemo
      } = req.body

      if (!title || !description) {
        return res.status(400).json({
          message:
            "Title and description are required"
        })
      }

      if (!req.file) {
        return res.status(400).json({
          message:
            "Project image is required"
        })
      }

      const uploadedImage =
        await uploadToCloudinary(req.file)

      const project =
        await Project.create({
          title,
          description,
          tech,
          github,
          liveDemo,
          image: uploadedImage.secure_url,
          owner: req.user.id
        })

      res.status(201).json({
        message:
          "Project created successfully",
        project
      })
    } catch (error) {
      console.error(
        "Project creation error:",
        error
      )

      res.status(500).json({
        message:
          "Project creation failed",
        error: error.message
      })
    }
  }
)

// =========================
// GET ALL PROJECTS
// =========================

router.get("/", async (req, res) => {
  try {
    const projects =
      await Project.find()
        .populate(
          "owner",
          "name email role"
        )
        .sort({
          createdAt: -1
        })

    res.status(200).json(projects)
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to fetch projects",
      error: error.message
    })
  }
})

// =========================
// GET PROJECT BY ID
// =========================

router.get("/:id", async (req, res) => {
  try {
    const project =
      await Project.findById(
        req.params.id
      ).populate(
        "owner",
        "name email role"
      )

    if (!project) {
      return res.status(404).json({
        message:
          "Project not found"
      })
    }

    res.status(200).json(project)
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to fetch project",
      error: error.message
    })
  }
})

// =========================
// LIKE / UNLIKE PROJECT
// =========================

router.post(
  "/:id/like",
  protect,
  async (req, res) => {
    try {
      const project =
        await Project.findById(
          req.params.id
        )

      if (!project) {
        return res.status(404).json({
          message:
            "Project not found"
        })
      }

      const userId = req.user.id

      const alreadyLiked =
        project.likedBy.some(
          (id) =>
            id.toString() === userId
        )

      if (alreadyLiked) {
        project.likedBy =
          project.likedBy.filter(
            (id) =>
              id.toString() !== userId
          )

        project.likes =
          Math.max(
            0,
            project.likes - 1
          )

        await project.save()

        return res.status(200).json({
          message:
            "Project unliked",
          likes:
            project.likes,
          liked: false
        })
      }

      project.likedBy.push(userId)
      project.likes += 1

      await project.save()

      res.status(200).json({
        message:
          "Project liked",
        likes:
          project.likes,
        liked: true
      })
    } catch (error) {
      console.error(
        "Like error:",
        error
      )

      res.status(500).json({
        message:
          "Failed to update like",
        error: error.message
      })
    }
  }
)

// =========================
// ADD COMMENT
// =========================

router.post(
  "/:id/comments",
  protect,
  async (req, res) => {
    try {
      const { text } = req.body

      const user =
        await User.findById(
          req.user.id
        )

      if (
        !user ||
        !user.name ||
        !text
      ) {
        return res.status(400).json({
          message:
            "Name and comment are required"
        })
      }

      const project =
        await Project.findById(
          req.params.id
        )

      if (!project) {
        return res.status(404).json({
          message:
            "Project not found"
        })
      }

      project.comments.push({
        name: user.name,
        text
      })

      await project.save()

      res.status(201).json({
        message:
          "Comment added successfully",
        comments:
          project.comments
      })
    } catch (error) {
      console.error(
        "Comment error:",
        error
      )

      res.status(500).json({
        message:
          "Failed to add comment",
        error: error.message
      })
    }
  }
)

// =========================
// UPDATE PROJECT
// =========================

router.put(
  "/:id",
  protect,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        tech,
        github,
        liveDemo
      } = req.body

      const project =
        await Project.findById(
          req.params.id
        )

      if (!project) {
        return res.status(404).json({
          message:
            "Project not found"
        })
      }

      if (
        project.owner.toString() !==
        req.user.id
      ) {
        return res.status(403).json({
          message:
            "You are not allowed to edit this project"
        })
      }

      project.title =
        title ?? project.title

      project.description =
        description ??
        project.description

      project.tech =
        tech ?? project.tech

      project.github =
        github ?? project.github

      project.liveDemo =
        liveDemo ??
        project.liveDemo

      // Update image only when a new image is uploaded

      if (req.file) {
        const uploadedImage =
          await uploadToCloudinary(
            req.file
          )

        project.image =
          uploadedImage.secure_url
      }

      await project.save()

      res.status(200).json({
        message:
          "Project updated successfully",
        project
      })
    } catch (error) {
      console.error(
        "Project update error:",
        error
      )

      res.status(500).json({
        message:
          "Project update failed",
        error: error.message
      })
    }
  }
)

// =========================
// DELETE PROJECT
// =========================

router.delete(
  "/:id",
  protect,
  async (req, res) => {
    try {
      const project =
        await Project.findById(
          req.params.id
        )

      if (!project) {
        return res.status(404).json({
          message:
            "Project not found"
        })
      }

      if (
        project.owner.toString() !==
        req.user.id
      ) {
        return res.status(403).json({
          message:
            "You are not allowed to delete this project"
        })
      }

      await Project.findByIdAndDelete(
        req.params.id
      )

      res.status(200).json({
        message:
          "Project deleted successfully"
      })
    } catch (error) {
      res.status(500).json({
        message:
          "Project deletion failed",
        error: error.message
      })
    }
  }
)

module.exports = router