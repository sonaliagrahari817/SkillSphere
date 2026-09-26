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

    const stream =
      cloudinary.uploader.upload_stream(
        {
          folder: "BuildOrbit/projects"
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
        await uploadToCloudinary(
          req.file
        )


      const project =
        await Project.create({

          title,
          description,
          tech,
          github,
          liveDemo,

          image:
            uploadedImage.secure_url,

          owner:
            req.user.id

        })
      // =========================
      // RECORD PROJECT CREATION ACTIVITY
      // =========================

      const user =
        await User.findById(req.user.id)

      project.activity.push({
        type: "project_created",

        user: req.user.id,

        message:
          `${user.name} created the project`
      })

      await project.save()


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

        error:
          error.message

      })

    }

  }
)


// =========================
// GET ALL PROJECTS
// =========================

router.get(
  "/",
  async (req, res) => {

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


      res.status(200).json(
        projects
      )

    } catch (error) {

      res.status(500).json({

        message:
          "Failed to fetch projects",

        error:
          error.message

      })

    }

  }
)


// =========================
// GET SAVED PROJECTS
// IMPORTANT: BEFORE /:id
// =========================

router.get(
  "/saved/my-projects",
  protect,
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.user.id
        ).populate({

          path:
            "savedProjects",

          populate: {

            path:
              "owner",

            select:
              "name email role"

          }

        })


      if (!user) {

        return res.status(404).json({
          message:
            "User not found"
        })

      }


      res.status(200).json({

        savedProjects:
          user.savedProjects || []

      })

    } catch (error) {

      console.error(
        "Saved projects fetch error:",
        error
      )

      res.status(500).json({

        message:
          "Failed to fetch saved projects",

        error:
          error.message

      })

    }

  }
)


// =========================
// GET PROJECT BY ID
// =========================

router.get(
  "/:id",
  async (req, res) => {

    try {

     const project =
        await Project.findById(
          req.params.id
        )
          .populate(
            "owner",
            "name email role"
          )
          .populate(
            "teamMembers",
            "name email role"
          )


      if (!project) {

        return res.status(404).json({

          message:
            "Project not found"

        })

      }


      res.status(200).json(
        project
      )

    } catch (error) {

      res.status(500).json({

        message:
          "Failed to fetch project",

        error:
          error.message

      })

    }

  }
)


// =========================
// SAVE / UNSAVE PROJECT
// =========================

router.post(
  "/:id/save",
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


      const user =
        await User.findById(
          req.user.id
        )


      if (!user) {

        return res.status(404).json({

          message:
            "User not found"

        })

      }


      const projectId =
        project._id.toString()


      const alreadySaved =
        user.savedProjects.some(
          (id) =>
            id.toString() ===
            projectId
        )


      // =========================
      // UNSAVE
      // =========================

      if (alreadySaved) {

        user.savedProjects =
          user.savedProjects.filter(
            (id) =>
              id.toString() !==
              projectId
          )


        await user.save()


        return res.status(200).json({

          message:
            "Project removed from saved projects",

          saved:
            false

        })

      }


      // =========================
      // SAVE
      // =========================

      user.savedProjects.push(
        project._id
      )


      await user.save()


      res.status(200).json({

        message:
          "Project saved successfully",

        saved:
          true

      })

    } catch (error) {

      console.error(
        "Save project error:",
        error
      )

      res.status(500).json({

        message:
          "Failed to save project",

        error:
          error.message

      })

    }

  }
)


// =========================
// ADD TEAM MEMBER
// =========================

router.post(
  "/:id/team-members",
  protect,
  async (req, res) => {

    try {

      const { userId } =
        req.body


      if (!userId) {

        return res.status(400).json({

          message:
            "User ID is required"

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


      // Only project owner
      // can add team members

      if (
        project.owner.toString() !==
        req.user.id
      ) {

        return res.status(403).json({

          message:
            "Only the project owner can add team members"

        })

      }


      // Check user exists

      const user =
        await User.findById(
          userId
        )


      if (!user) {

        return res.status(404).json({

          message:
            "User not found"

        })

      }


      // Owner cannot be added

      if (
        project.owner.toString() ===
        userId
      ) {

        return res.status(400).json({

          message:
            "Project owner is already a team member"

        })

      }


      // Prevent duplicate members

      const alreadyMember =
        project.teamMembers.some(
          (id) =>
            id.toString() ===
            userId
        )


      if (alreadyMember) {

        return res.status(400).json({

          message:
            "User is already a team member"

        })

      }


      // Add member

      project.teamMembers.push(
        userId
      )
     // =========================
      // RECORD TEAM MEMBER ACTIVITY
      // =========================

      const owner =
        await User.findById(req.user.id)

      project.activity.push({
        type: "team_member_added",

        user: req.user.id,

        message:
          `${owner.name} added ${user.name} to the project`
      })

      await project.save()


      // Return updated team members

      const updatedProject =
        await Project.findById(
          project._id
        ).populate(
          "teamMembers",
          "name email role"
        )


      res.status(200).json({

        message:
          "Team member added successfully",

        teamMembers:
          updatedProject.teamMembers

      })

    } catch (error) {

      console.error(
        "Add team member error:",
        error
      )

      res.status(500).json({

        message:
          "Failed to add team member",

        error:
          error.message

      })

    }

  }
)


// =========================
// REMOVE TEAM MEMBER
// =========================

router.delete(
  "/:id/team-members/:userId",
  protect,
  async (req, res) => {

    try {

      const {
        id: projectId,
        userId
      } = req.params


      // Find project

      const project =
        await Project.findById(
          projectId
        )


      if (!project) {

        return res.status(404).json({

          message:
            "Project not found"

        })

      }


      // Only project owner
      // can remove team members

      if (
        project.owner.toString() !==
        req.user.id
      ) {

        return res.status(403).json({

          message:
            "Only the project owner can remove team members"

        })

      }


      // Check whether user
      // is actually a team member

      const isMember =
        project.teamMembers.some(
          (memberId) =>
            memberId.toString() ===
            userId
        )


      if (!isMember) {

        return res.status(400).json({

          message:
            "User is not a team member"

        })

      }


      // Remove member

      project.teamMembers =
        project.teamMembers.filter(
          (memberId) =>
            memberId.toString() !==
            userId
        )
      // =========================
      // RECORD TEAM MEMBER REMOVAL ACTIVITY
      // =========================

      const owner =
        await User.findById(req.user.id)

      const removedUser =
        await User.findById(userId)

      project.activity.push({
        type: "team_member_removed",

        user: req.user.id,

        message:
          `${owner.name} removed ${removedUser.name} from the project`
      })


      await project.save()


      // Return updated team members

      const updatedProject =
        await Project.findById(
          project._id
        ).populate(
          "teamMembers",
          "name email role"
        )


      res.status(200).json({

        message:
          "Team member removed successfully",

        teamMembers:
          updatedProject.teamMembers

      })

    } catch (error) {

      console.error(
        "Remove team member error:",
        error
      )

      res.status(500).json({

        message:
          "Failed to remove team member",

        error:
          error.message

      })

    }

  }
)


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


      const userId =
        req.user.id


      const alreadyLiked =
        project.likedBy.some(
          (id) =>
            id.toString() ===
            userId
        )


      if (alreadyLiked) {

        project.likedBy =
          project.likedBy.filter(
            (id) =>
              id.toString() !==
              userId
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

          liked:
            false

        })

      }


      project.likedBy.push(
        userId
      )

      project.likes += 1


      await project.save()


      res.status(200).json({

        message:
          "Project liked",

        likes:
          project.likes,

        liked:
          true

      })

    } catch (error) {

      console.error(
        "Like error:",
        error
      )

      res.status(500).json({

        message:
          "Failed to update like",

        error:
          error.message

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

      const { text } =
        req.body


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
        user: user._id,
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

        error:
          error.message

      })

    }

  }
)
// =========================
// DELETE COMMENT
// =========================

router.delete(
  "/:id/comments/:commentId",
  protect,
  async (req, res) => {
    try {
      const project = await Project.findById(
        req.params.id
      )

      if (!project) {
        return res.status(404).json({
          message: "Project not found"
        })
      }

      const comment = project.comments.id(
        req.params.commentId
      )

      if (!comment) {
        return res.status(404).json({
          message: "Comment not found"
        })
      }

      // Old comments may not have a user ID
      if (!comment.user) {
        return res.status(403).json({
          message:
            "This comment cannot be deleted"
        })
      }

      // Only the comment author can delete it
      if (
        comment.user.toString() !==
        req.user.id.toString()
      ) {
        return res.status(403).json({
          message:
            "You can only delete your own comments"
        })
      }

      comment.deleteOne()

      await project.save()

      res.status(200).json({
        message:
          "Comment deleted successfully",
        comments: project.comments
      })
    } catch (error) {
      console.error(
        "Delete comment error:",
        error
      )

      res.status(500).json({
        message:
          "Failed to delete comment",
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


      // Update image only when
      // a new image is uploaded

      if (req.file) {

        const uploadedImage =
          await uploadToCloudinary(
            req.file
          )

        project.image =
          uploadedImage.secure_url

      }
      // =========================
        // RECORD PROJECT UPDATE ACTIVITY
        // =========================

        const user =
          await User.findById(req.user.id)

        project.activity.push({
          type: "project_updated",

          user: req.user.id,

          message:
            `${user.name} updated the project`
        })


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

        error:
          error.message

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

        error:
          error.message

      })

    }

  }
)


module.exports = router