const User = require("../models/User")
const express = require("express")
const Project = require("../models/Project")
const protect = require("../middleware/authMiddleware")
const multer = require("multer")
const path = require("path")
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9)

    cb(
      null,
      uniqueName + path.extname(file.originalname)
    )
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
}
})
const router = express.Router()

// Create a project
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const {
      title,
      description,
      tech,
      github,
      liveDemo,
    } = req.body

   if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required"
      })
    }
    if (!req.file) {
      return res.status(400).json({
        message: "Project image is required"
      })
    }
    const project = await Project.create({
      title,
      description,
      tech,
      github,
      liveDemo,
      image: `/uploads/${req.file.filename}`,
      owner: req.user.id
    })

    res.status(201).json({
      message: "Project created successfully",
      project
    })
  } catch (error) {
    res.status(500).json({
      message: "Project creation failed",
      error: error.message
    })
  }
})

// Get all projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("owner", "name email role")
      .sort({ createdAt: -1 })

    res.status(200).json(projects)
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch projects",
      error: error.message
    })
  }
})
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email role")

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      })
    }

    res.status(200).json(project)
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch project",
      error: error.message
    })
  }
})
router.post(
  "/:id/like",
  protect,
  async (req, res) => {
    try {
      const project =
        await Project.findById(req.params.id)

      if (!project) {
        return res.status(404).json({
          message: "Project not found"
        })
      }

      const userId = req.user.id

      const alreadyLiked =
        project.likedBy.some(
          (id) => id.toString() === userId
        )

      if (alreadyLiked) {
        project.likedBy =
          project.likedBy.filter(
            (id) => id.toString() !== userId
          )

        project.likes = Math.max(
          0,
          project.likes - 1
        )

        await project.save()

        return res.status(200).json({
          message: "Project unliked",
          likes: project.likes,
          liked: false
        })
      }

      project.likedBy.push(userId)
      project.likes += 1

      await project.save()

      res.status(200).json({
        message: "Project liked",
        likes: project.likes,
        liked: true
      })
    } catch (error) {
      console.error(
        "Like error:",
        error
      )

      res.status(500).json({
        message: "Failed to update like",
        error: error.message
      })
    }
  }
)
router.post("/:id/comments", protect, async (req, res) => {
  try {
    const { text } = req.body

    const user = await User.findById(req.user.id)

    if (!user || !user.name || !text) {
      return res.status(400).json({
        message: "Name and comment are required"
      })
    }

    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      })
    }

    project.comments.push({
      name: user.name,
      text
    })

    await project.save()

    res.status(201).json({
      message: "Comment added successfully",
      comments: project.comments
    })
  } catch (error) {
    console.error(
      "Comment error:",
      error
    )

    res.status(500).json({
      message: "Failed to add comment",
      error: error.message
    })
  }
})
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

      const project = await Project.findById(
        req.params.id
      )

      if (!project) {
        return res.status(404).json({
          message: "Project not found"
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
        description ?? project.description

      project.tech =
        tech ?? project.tech

      project.github =
        github ?? project.github

      project.liveDemo =
        liveDemo ?? project.liveDemo

      // Update image only when a new image is uploaded

      if (req.file) {
        project.image =
          `/uploads/${req.file.filename}`
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
router.delete("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      })
    }
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to delete this project"
      })
    }

    await Project.findByIdAndDelete(req.params.id)

    res.status(200).json({
      message: "Project deleted successfully"
    })
  } catch (error) {
    res.status(500).json({
      message: "Project deletion failed",
      error: error.message
    })
  }
})
module.exports = router