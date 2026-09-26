const express = require("express")
const protect = require("../middleware/authMiddleware")
const SkillAssessment = require("../models/SkillAssessment")
const User = require("../models/User")

const router = express.Router()

// =========================
// ASSESSMENT QUESTION BANK
// =========================

const questionBank = {
  javascript: [
    {
      id: 1,
      question:
        "Which keyword is used to declare a block-scoped variable in JavaScript?",
      options: ["var", "let", "define", "variable"],
      answer: "let"
    },
    {
      id: 2,
      question:
        "Which method is used to add an element to the end of an array?",
      options: ["push()", "pop()", "shift()", "unshift()"],
      answer: "push()"
    },
    {
      id: 3,
      question:
        "Which operator checks both value and type in JavaScript?",
      options: ["==", "=", "===", "!="],
      answer: "==="
    },
    {
      id: 4,
      question:
        "Which function converts a JSON string into a JavaScript object?",
      options: [
        "JSON.parse()",
        "JSON.stringify()",
        "JSON.convert()",
        "JSON.object()"
      ],
      answer: "JSON.parse()"
    },
    {
      id: 5,
      question:
        "Which method creates a new array by transforming every element?",
      options: [
        "filter()",
        "map()",
        "reduce()",
        "forEach()"
      ],
      answer: "map()"
    },
    {
      id: 6,
      question:
        "Which keyword is used to define a function that returns a Promise?",
      options: [
        "async",
        "promise",
        "await",
        "defer"
      ],
      answer: "async"
    },
    {
      id: 7,
      question:
        "What does typeof null return in JavaScript?",
      options: [
        "null",
        "undefined",
        "object",
        "boolean"
      ],
      answer: "object"
    },
    {
      id: 8,
      question:
        "Which method removes the last element from an array?",
      options: [
        "shift()",
        "remove()",
        "delete()",
        "pop()"
      ],
      answer: "pop()"
    },
    {
      id: 9,
      question:
        "Which value represents an intentionally empty value?",
      options: [
        "null",
        "undefined",
        "false",
        "0"
      ],
      answer: "null"
    },
    {
      id: 10,
      question:
        "Which feature allows a function to remember variables from its outer scope?",
      options: [
        "Closure",
        "Inheritance",
        "Hoisting",
        "Prototype"
      ],
      answer: "Closure"
    }
  ]
}


// =========================
// LEARNING ROADMAP
// =========================

const roadmap = {
  javascript: {
    Beginner: [
      "JavaScript Fundamentals",
      "Variables and Data Types",
      "Operators and Conditions",
      "Loops and Functions",
      "Arrays and Objects"
    ],

    Intermediate: [
      "Advanced Functions",
      "Array Methods",
      "DOM Manipulation",
      "Asynchronous JavaScript",
      "Promises and Async/Await"
    ],

    Advanced: [
      "Advanced JavaScript Concepts",
      "Closures and Execution Context",
      "Advanced Async JavaScript",
      "ES6+ Patterns and Best Practices",
      "JavaScript Performance and Optimization"
    ]
  }
}


// =========================
// GET QUESTIONS
// =========================

router.get("/questions", protect, (req, res) => {
  try {
    const skill = (
      req.query.skill || "javascript"
    ).toLowerCase()

    const questions = questionBank[skill]

    if (!questions) {
      return res.status(404).json({
        message:
          "Assessment for this skill is not available yet"
      })
    }

    const safeQuestions = questions.map(
      ({ answer, ...question }) => question
    )

    res.status(200).json({
      skill,
      totalQuestions: safeQuestions.length,
      questions: safeQuestions
    })
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch assessment questions",
      error: error.message
    })
  }
})


// =========================
// GET ASSESSMENT HISTORY
// =========================

router.get("/history", protect, async (req, res) => {
  try {
    const assessments = await SkillAssessment.find({
      user: req.user.id
    }).sort({ createdAt: -1 })

    res.status(200).json({
      assessments
    })
  } catch (error) {
    console.error(
      "Assessment history error:",
      error
    )

    res.status(500).json({
      message: "Failed to fetch assessment history",
      error: error.message
    })
  }
})


// =========================
// GET ASSESSMENT ANALYTICS
// =========================

router.get("/analytics", protect, async (req, res) => {
  try {
    const assessments = await SkillAssessment.find({
      user: req.user.id
    }).sort({ createdAt: 1 })

    if (assessments.length === 0) {
      return res.status(200).json({
        totalAssessments: 0,
        latestScore: 0,
        highestScore: 0,
        averageScore: 0,
        currentLevel: "Not Assessed",
        progress: 0
      })
    }

    const totalAssessments = assessments.length

    const latestAssessment =
      assessments[assessments.length - 1]

    const latestScore =
      latestAssessment.percentage

    const highestScore = Math.max(
      ...assessments.map(
        (assessment) => assessment.percentage
      )
    )

    const averageScore = Math.round(
      assessments.reduce(
        (total, assessment) =>
          total + assessment.percentage,
        0
      ) / totalAssessments
    )

    const firstScore =
      assessments[0].percentage

    const progress = Math.max(
      0,
      latestScore - firstScore
    )

    res.status(200).json({
      totalAssessments,
      latestScore,
      highestScore,
      averageScore,
      currentLevel: latestAssessment.level,
      progress
    })
  } catch (error) {
    console.error(
      "Assessment analytics error:",
      error
    )

    res.status(500).json({
      message:
        "Failed to fetch assessment analytics",
      error: error.message
    })
  }
})


// =========================
// GET PERSONALIZED ROADMAP
// =========================

router.get("/roadmap", protect, async (req, res) => {
  try {
    const skill = (
      req.query.skill || "javascript"
    ).toLowerCase()

    const latestAssessment =
      await SkillAssessment.findOne({
        user: req.user.id,
        skill
      }).sort({ createdAt: -1 })

    if (!latestAssessment) {
      return res.status(404).json({
        message:
          "Please complete a skill assessment first"
      })
    }

    const skillRoadmap = roadmap[skill]

    if (!skillRoadmap) {
      return res.status(404).json({
        message:
          "Learning roadmap for this skill is not available yet"
      })
    }

    const levelRoadmap =
      skillRoadmap[latestAssessment.level]

    res.status(200).json({
      skill,
      level: latestAssessment.level,
      percentage: latestAssessment.percentage,
      roadmap: levelRoadmap
    })
  } catch (error) {
    console.error(
      "Roadmap error:",
      error
    )

    res.status(500).json({
      message: "Failed to fetch learning roadmap",
      error: error.message
    })
  }
})


// =========================
// GET ROADMAP PROGRESS
// =========================

router.get(
  "/roadmap/progress",
  protect,
  async (req, res) => {
    try {
      const user = await User.findById(
        req.user.id
      ).select(
        "completedRoadmapTopics roadmapProgress"
      )

      if (!user) {
        return res.status(404).json({
          message: "User not found"
        })
      }

      res.status(200).json({
        completedRoadmapTopics:
          user.completedRoadmapTopics || [],

        roadmapProgress:
          user.roadmapProgress || []
      })
    } catch (error) {
      console.error(
        "Roadmap progress fetch error:",
        error
      )

      res.status(500).json({
        message:
          "Failed to fetch roadmap progress",
        error: error.message
      })
    }
  }
)


// =========================
// UPDATE ROADMAP PROGRESS
// =========================

router.put(
  "/roadmap/progress",
  protect,
  async (req, res) => {
    try {
      const {
        completedRoadmapTopics
      } = req.body

      if (
        !Array.isArray(
          completedRoadmapTopics
        )
      ) {
        return res.status(400).json({
          message:
            "completedRoadmapTopics must be an array"
        })
      }

      const user = await User.findById(
        req.user.id
      )

      if (!user) {
        return res.status(404).json({
          message: "User not found"
        })
      }

      // Remove duplicate topics
      const uniqueTopics = [
        ...new Set(completedRoadmapTopics)
      ]

      // Existing progress records
      const existingProgress =
        user.roadmapProgress || []

      // Create updated progress records
      const updatedProgress =
        uniqueTopics.map((topic) => {

          const existingTopic =
            existingProgress.find(
              (item) =>
                item.topic === topic
            )

          // Keep original completion date
          if (existingTopic) {
            return {
              topic: existingTopic.topic,
              completedAt:
                existingTopic.completedAt
            }
          }

          // New completion
          return {
            topic,
            completedAt: new Date()
          }
        })

      // Update both fields
      user.completedRoadmapTopics =
        uniqueTopics

      user.roadmapProgress =
        updatedProgress

      await user.save()

      res.status(200).json({
        message:
          "Roadmap progress saved successfully",

        completedRoadmapTopics:
          user.completedRoadmapTopics,

        roadmapProgress:
          user.roadmapProgress
      })
    } catch (error) {
      console.error(
        "Roadmap progress update error:",
        error
      )

      res.status(500).json({
        message:
          "Failed to save roadmap progress",
        error: error.message
      })
    }
  }
)


// =========================
// SUBMIT ASSESSMENT
// =========================

router.post("/submit", protect, async (req, res) => {
  try {
    const { skill, answers } = req.body

    if (!skill || !Array.isArray(answers)) {
      return res.status(400).json({
        message: "Skill and answers are required"
      })
    }

    const normalizedSkill =
      skill.toLowerCase()

    const questions =
      questionBank[normalizedSkill]

    if (!questions) {
      return res.status(404).json({
        message:
          "Assessment for this skill is not available yet"
      })
    }

    if (answers.length !== questions.length) {
      return res.status(400).json({
        message:
          `Please answer all ${questions.length} questions`
      })
    }

    let score = 0

    questions.forEach((question) => {
      const submittedAnswer =
        answers.find(
          (item) =>
            item.questionId === question.id
        )

      if (
        submittedAnswer &&
        submittedAnswer.selectedOption ===
          question.answer
      ) {
        score++
      }
    })

    const percentage = Math.round(
      (score / questions.length) * 100
    )

    let level = "Beginner"

    if (percentage >= 80) {
      level = "Advanced"
    } else if (percentage >= 50) {
      level = "Intermediate"
    }

    const assessment =
      await SkillAssessment.create({
        user: req.user.id,
        skill: normalizedSkill,
        score,
        totalQuestions: questions.length,
        percentage,
        level
      })

    res.status(201).json({
      message:
        "Assessment submitted successfully",

      result: {
        id: assessment._id,
        skill: assessment.skill,
        score: assessment.score,
        totalQuestions:
          assessment.totalQuestions,
        percentage:
          assessment.percentage,
        level: assessment.level,
        completedAt:
          assessment.createdAt
      }
    })
  } catch (error) {
    console.error(
      "Assessment submission error:",
      error
    )

    res.status(500).json({
      message:
        "Assessment submission failed",
      error: error.message
    })
  }
})


module.exports = router