import "./SkillAssessment.css"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const assessmentApi = axios.create({
  baseURL:
    window.location.hostname === "localhost"
      ? "http://localhost:5000/api"
      : "https://BuildOrbit-backend-puyd.onrender.com/api"
})

function SkillAssessment() {
  const navigate = useNavigate()

  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")

  // Store references of every question card
  const questionRefs = useRef({})

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem("token")

        const response = await assessmentApi.get(
          "/assessments/questions?skill=javascript",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        setQuestions(response.data.questions)
      } catch (error) {
        console.error("Assessment fetch error:", error)

        setError(
          error.response?.data?.message ||
            "Failed to load assessment"
        )
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [])

  const handleAnswerChange = (questionId, selectedOption) => {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [questionId]: selectedOption
    }))

    setError("")
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    // Find the first unanswered question
    const firstUnansweredIndex = questions.findIndex(
      (question) => !answers[question.id]
    )

    // If any question is unanswered
    if (firstUnansweredIndex !== -1) {
      const unansweredQuestion =
        questions[firstUnansweredIndex]

      setError(
        `Please answer Question ${
          firstUnansweredIndex + 1
        } before submitting.`
      )

      // Scroll to the first unanswered question
      setTimeout(() => {
        questionRefs.current[
          unansweredQuestion.id
        ]?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        })
      }, 100)

      return
    }

    try {
      setSubmitting(true)
      setError("")

      const token = localStorage.getItem("token")

      const formattedAnswers = questions.map((question) => ({
        questionId: question.id,
        selectedOption: answers[question.id]
      }))

      const response = await assessmentApi.post(
        "/assessments/submit",
        {
          skill: "javascript",
          answers: formattedAnswers
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setResult(response.data.result)
    } catch (error) {
      console.error("Assessment submit error:", error)

      setError(
        error.response?.data?.message ||
          "Failed to submit assessment"
      )
    } finally {
      setSubmitting(false)
    }
  }

  /* LOADING */

  if (loading) {
    return (
      <main className="assessment-loading">
        <h2>Loading assessment...</h2>
      </main>
    )
  }

  /* RESULT */

  if (result) {
    return (
      <main className="skill-assessment-page">
        <div className="skill-assessment-container">

          <div className="assessment-result">

            <div className="result-icon">
              ✓
            </div>

            <h1>
              Assessment Complete
            </h1>

            <p className="result-skill">
              {result.skill.toUpperCase()}
            </p>

            <div className="result-score">
              {result.score}/{result.totalQuestions}
            </div>

            <p className="result-percentage">
              You scored {result.percentage}%
            </p>

            <div className="result-level">
              {result.level} Level
            </div>

            <br />

            <button
              className="result-back-button"
              onClick={() => navigate("/profile")}
            >
              Back to Profile
            </button>

          </div>

        </div>
      </main>
    )
  }

  /* PROGRESS */

  const answeredCount = Object.keys(answers).length

  const progress =
    questions.length > 0
      ? (answeredCount / questions.length) * 100
      : 0

  /* ASSESSMENT */

  return (
    <main className="skill-assessment-page">

      <div className="skill-assessment-container">

        {/* HEADER */}

        <section className="assessment-header">

          <p className="assessment-label">
            SKILL ASSESSMENT
          </p>

          <h1>
            JavaScript Assessment
          </h1>

          <p>
            Test your JavaScript knowledge and discover
            your current skill level.
          </p>

        </section>


        {/* PROGRESS */}

        <div className="assessment-progress">

          <div className="progress-info">

            <span>
              Progress
            </span>

            <span>
              {answeredCount}/{questions.length}
            </span>

          </div>

          <div className="progress-bar">

            <div
              className="progress-fill"
              style={{
                width: `${progress}%`
              }}
            ></div>

          </div>

        </div>


        {/* ERROR */}

        {error && (
          <div className="assessment-error">
            {error}
          </div>
        )}


        {/* QUESTIONS */}

        <form onSubmit={handleSubmit}>

          {questions.map((question, index) => (

            <div
              className="question-card"
              key={question.id}
              ref={(element) => {
                questionRefs.current[question.id] =
                  element
              }}
            >

              <div className="question-number">
                QUESTION {index + 1}
              </div>

              <h3>
                {question.question}
              </h3>

              <div className="options-container">

                {question.options.map((option) => {

                  const isSelected =
                    answers[question.id] === option

                  return (
                    <label
                      key={option}
                      className={
                        `option-label ${
                          isSelected
                            ? "selected"
                            : ""
                        }`
                      }
                    >

                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={isSelected}
                        onChange={() =>
                          handleAnswerChange(
                            question.id,
                            option
                          )
                        }
                      />

                      <span>
                        {option}
                      </span>

                    </label>
                  )
                })}

              </div>

            </div>

          ))}


          {/* SUBMIT */}

          <div className="assessment-submit-container">

            <button
              type="submit"
              className="assessment-submit-button"
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : "Submit Assessment"}
            </button>

          </div>

        </form>

      </div>

    </main>
  )
}

export default SkillAssessment