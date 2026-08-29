const express = require("express")
const bcrypt = require("bcryptjs")
const User = require("../models/User")
const jwt = require("jsonwebtoken")
const protect = require("../middleware/authMiddleware")
const router = express.Router()

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required"
      })
    }

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    })

    res.status(201).json({
      message: "Account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        skills: user.skills,
        github: user.github,
        linkedin: user.linkedin
      }
    })
  } catch (error) {
    res.status(500).json({
      message: "Signup failed",
      error: error.message
    })
  }
})

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      })
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    )

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password"
      })
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    )

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        skills: user.skills,
        github: user.github,
        linkedin: user.linkedin
      }
    })
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message
    })
  }
})

// UPDATE PROFILE
router.put("/profile/:id", protect, async (req, res) => {
  try {
    const {
      name,
      bio,
      skills,
      github,
      linkedin
    } = req.body

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      })
    }
    if (user._id.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to update this profile"
      })
    }

    user.name = name ?? user.name
    user.bio = bio ?? user.bio
    user.skills = skills ?? user.skills
    user.github = github ?? user.github
    user.linkedin = linkedin ?? user.linkedin

    await user.save()

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        skills: user.skills,
        github: user.github,
        linkedin: user.linkedin
      }
    })
  } catch (error) {
    res.status(500).json({
      message: "Profile update failed",
      error: error.message
    })
  }
})
// Get single user
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("name email role skills bio github linkedin")

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      })
    }

    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user",
      error: error.message
    })
  }
})

// GET ALL USERS
router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("name email role skills bio github linkedin")
      .sort({ createdAt: -1 })

    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message
    })
  }
})

module.exports = router