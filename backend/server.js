const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
require("dotenv").config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Serve uploaded project images
app.use("/uploads", express.static("uploads"))

// Routes
const authRoutes = require("./routes/authRoutes")
const projectRoutes = require("./routes/projectRoutes")

app.use("/api/auth", authRoutes)
app.use("/api/projects", projectRoutes)

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "SkillSphere API is running"
  })
})

const PORT = process.env.PORT || 5000

console.log("Mongo URI loaded:", !!process.env.MONGO_URI)

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully")

    app.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      )
    })
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error.message
    )
  })