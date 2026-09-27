import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "./Profile.css"

function Profile() {
  const { user } = useAuth()

  const [projects, setProjects] = useState([])
  const [loadingProjects, setLoadingProjects] = useState(false)

  const [savedProjects, setSavedProjects] = useState([])
  const [loadingSavedProjects, setLoadingSavedProjects] =
    useState(false)

  const [assessments, setAssessments] = useState([])
  const [loadingAssessments, setLoadingAssessments] =
    useState(false)

  const [analytics, setAnalytics] = useState(null)
  const [loadingAnalytics, setLoadingAnalytics] =
    useState(false)

  const [roadmap, setRoadmap] = useState(null)
  const [loadingRoadmap, setLoadingRoadmap] =
    useState(false)

  const [completedTopics, setCompletedTopics] =
    useState([])

  const [loadingRoadmapProgress, setLoadingRoadmapProgress] =
    useState(false)

  const [roadmapProgressData, setRoadmapProgressData] =
    useState([])


  // =========================
  // FETCH MY PROJECTS
  // =========================

  useEffect(() => {
    const fetchMyProjects = async () => {
      if (!user) {
        return
      }

      setLoadingProjects(true)

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/projects`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message)
        }

        const myProjects = data.filter(
          (project) =>
            project.owner?._id === user.id ||
            project.owner === user.id
        )

        setProjects(myProjects)
      } catch (error) {
        console.error(
          "Profile projects error:",
          error
        )
      } finally {
        setLoadingProjects(false)
      }
    }

    fetchMyProjects()
  }, [user])


  // =========================
  // FETCH SAVED PROJECTS
  // =========================

  useEffect(() => {
    const fetchSavedProjects = async () => {
      if (!user) {
        return
      }

      setLoadingSavedProjects(true)

      try {
        const token = localStorage.getItem("token")

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/projects/saved/my-projects`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message)
        }

        setSavedProjects(data.savedProjects || [])
      } catch (error) {
        console.error(
          "Saved projects fetch error:",
          error
        )
      } finally {
        setLoadingSavedProjects(false)
      }
    }

    fetchSavedProjects()
  }, [user])


  // =========================
  // FETCH ASSESSMENT HISTORY
  // =========================

  useEffect(() => {
    const fetchAssessmentHistory = async () => {
      if (!user) {
        return
      }

      setLoadingAssessments(true)

      try {
        const token = localStorage.getItem("token")

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/assessments/history`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message)
        }

        setAssessments(data.assessments || [])
      } catch (error) {
        console.error(
          "Assessment history error:",
          error
        )
      } finally {
        setLoadingAssessments(false)
      }
    }

    fetchAssessmentHistory()
  }, [user])


  // =========================
  // FETCH ASSESSMENT ANALYTICS
  // =========================

  useEffect(() => {
    const fetchAssessmentAnalytics = async () => {
      if (!user) {
        return
      }

      setLoadingAnalytics(true)

      try {
        const token = localStorage.getItem("token")

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/assessments/analytics`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message)
        }

        setAnalytics(data)
      } catch (error) {
        console.error(
          "Assessment analytics error:",
          error
        )
      } finally {
        setLoadingAnalytics(false)
      }
    }

    fetchAssessmentAnalytics()
  }, [user])


  // =========================
  // FETCH PERSONALIZED ROADMAP
  // =========================

  useEffect(() => {
    const fetchRoadmap = async () => {
      if (!user) {
        return
      }

      setLoadingRoadmap(true)

      try {
        const token = localStorage.getItem("token")

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/assessments/roadmap?skill=javascript`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message)
        }

        setRoadmap(data)
      } catch (error) {
        console.error(
          "Roadmap error:",
          error
        )
      } finally {
        setLoadingRoadmap(false)
      }
    }

    fetchRoadmap()
  }, [user])


  // =========================
  // FETCH ROADMAP PROGRESS
  // =========================

  useEffect(() => {
    const fetchRoadmapProgress = async () => {
      if (!user) {
        return
      }

      setLoadingRoadmapProgress(true)

      try {
        const token = localStorage.getItem("token")

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/assessments/roadmap/progress`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message)
        }

        setCompletedTopics(
          data.completedRoadmapTopics || []
        )

        setRoadmapProgressData(
          data.roadmapProgress || []
        )
      } catch (error) {
        console.error(
          "Roadmap progress fetch error:",
          error
        )
      } finally {
        setLoadingRoadmapProgress(false)
      }
    }

    fetchRoadmapProgress()
  }, [user])


  // =========================
  // TOGGLE ROADMAP TOPIC
  // =========================

  const toggleRoadmapTopic = async (topic) => {
    try {
      const token = localStorage.getItem("token")

      const updatedTopics =
        completedTopics.includes(topic)
          ? completedTopics.filter(
              (item) => item !== topic
            )
          : [
              ...completedTopics,
              topic
            ]

      setCompletedTopics(updatedTopics)

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/assessments/roadmap/progress`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            completedRoadmapTopics:
              updatedTopics
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message)
      }

      setCompletedTopics(
        data.completedRoadmapTopics || []
      )

      setRoadmapProgressData(
        data.roadmapProgress || []
      )
    } catch (error) {
      console.error(
        "Roadmap progress update error:",
        error
      )
    }
  }


  // =========================
  // GET ROADMAP COMPLETION DATE
  // =========================

  const getRoadmapCompletionDate = (topic) => {
    const progressItem =
      roadmapProgressData.find(
        (item) => item.topic === topic
      )

    if (!progressItem?.completedAt) {
      return null
    }

    return new Date(
      progressItem.completedAt
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })
  }


  // =========================
  // LOGIN CHECK
  // =========================

  if (!user) {
    return (
      <main className="profile-page-new">

        <section className="profile-state">

          <div className="profile-state-icon">
            ◇
          </div>

          <h1>
            Please login first
          </h1>

          <p>
            You need to login to view your profile.
          </p>

          <Link to="/login">
            Login →
          </Link>

        </section>

      </main>
    )
  }


  // =========================
  // USER DATA
  // =========================

  const skills = user.skills
    ? user.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    : []

  const role =
    user.role === "developer"
      ? "Developer"
      : "Creator"


  // =========================
  // ROADMAP PROGRESS
  // =========================

  const completedCount = roadmap
    ? roadmap.roadmap.filter(
        (step) =>
          completedTopics.includes(step)
      ).length
    : 0

  const roadmapProgress =
    roadmap &&
    roadmap.roadmap.length > 0
      ? Math.round(
          (completedCount /
            roadmap.roadmap.length) *
            100
        )
      : 0


  // =========================
  // OVERALL PROGRESS
  // =========================

  const overallProgress =
    analytics && roadmap
      ? Math.round(
          (
            Number(
              analytics.latestScore || 0
            ) +
            roadmapProgress
          ) / 2
        )
      : 0


  // =========================
  // ACHIEVEMENTS
  // =========================

  const achievements = [
    {
      id: "first-assessment",
      icon: "🎯",
      title: "First Assessment",
      description:
        "Completed your first skill assessment.",
      unlocked:
        assessments.length >= 1
    },

    {
      id: "roadmap-starter",
      icon: "🗺️",
      title: "Roadmap Starter",
      description:
        "Completed your first roadmap topic.",
      unlocked:
        completedCount >= 1
    },

    {
      id: "roadmap-explorer",
      icon: "🔥",
      title: "Roadmap Explorer",
      description:
        "Completed 3 roadmap topics.",
      unlocked:
        completedCount >= 3
    },

    {
      id: "roadmap-master",
      icon: "🏆",
      title: "Roadmap Master",
      description:
        "Completed your entire learning roadmap.",
      unlocked:
        roadmap &&
        roadmap.roadmap.length > 0 &&
        completedCount ===
          roadmap.roadmap.length
    },

    {
      id: "portfolio-builder",
      icon: "💻",
      title: "Portfolio Builder",
      description:
        "Added your first project.",
      unlocked:
        projects.length >= 1
    },

    {
      id: "project-creator",
      icon: "🚀",
      title: "Project Creator",
      description:
        "Added 3 projects to your portfolio.",
      unlocked:
        projects.length >= 3
    }
  ]

  const unlockedAchievements =
    achievements.filter(
      (achievement) =>
        achievement.unlocked
    ).length


  return (
    <main className="profile-page-new">

      <div className="profile-container">


        {/* =========================
            PROFILE HERO
        ========================= */}

        <section className="profile-hero-card">

          <div className="profile-cover"></div>

          <div className="profile-main">

            <div className="profile-avatar">
              {user.name
                ?.charAt(0)
                .toUpperCase()}
            </div>

            <div className="profile-identity">

              <p className="section-label">
                {role.toUpperCase()}
              </p>

              <h1>
                {user.name}
              </h1>

              <p className="profile-email-new">
                {user.email}
              </p>

            </div>

            <Link
              to="/edit-profile"
              className="profile-edit-button"
            >
              Edit Profile
            </Link>

          </div>

        </section>


        {/* =========================
            CAREER OVERVIEW
        ========================= */}

        <section className="profile-section-card career-overview-section">

          <div className="profile-section-heading">

            <div>

              <p className="section-label">
                CAREER OVERVIEW
              </p>

              <h2>
                Your Progress
              </h2>

            </div>

            <span className="career-overview-badge">
              BuildOrbit
            </span>

          </div>


          <div className="career-overview-grid">


            {/* ASSESSMENT */}

            <div className="career-stat-card">

              <div className="career-stat-icon">
                🎯
              </div>

              <div className="career-stat-content">

                <span>
                  Latest Assessment
                </span>

                <strong>
                  {analytics
                    ? `${analytics.latestScore}%`
                    : "--"}
                </strong>

                <small>
                  {analytics?.currentLevel ||
                    "No assessment yet"}
                </small>

              </div>

            </div>


            {/* ROADMAP */}

            <div className="career-stat-card">

              <div className="career-stat-icon">
                🗺️
              </div>

              <div className="career-stat-content">

                <span>
                  Roadmap Progress
                </span>

                <strong>
                  {roadmap
                    ? `${roadmapProgress}%`
                    : "--"}
                </strong>

                <small>
                  {roadmap
                    ? `${completedCount}/${roadmap.roadmap.length} topics completed`
                    : "No roadmap yet"}
                </small>

              </div>

            </div>


            {/* PROJECTS */}

            <div className="career-stat-card">

              <div className="career-stat-icon">
                💻
              </div>

              <div className="career-stat-content">

                <span>
                  Portfolio Projects
                </span>

                <strong>
                  {projects.length}
                </strong>

                <small>
                  {projects.length === 1
                    ? "Project added"
                    : "Projects added"}
                </small>

              </div>

            </div>


            {/* SKILLS */}

            <div className="career-stat-card">

              <div className="career-stat-icon">
                ⚡
              </div>

              <div className="career-stat-content">

                <span>
                  Skills
                </span>

                <strong>
                  {skills.length}
                </strong>

                <small>
                  Technologies in profile
                </small>

              </div>

            </div>


            {/* SAVED PROJECTS */}

            <div className="career-stat-card">

              <div className="career-stat-icon">
                🔖
              </div>

              <div className="career-stat-content">

                <span>
                  Saved Projects
                </span>

                <strong>
                  {loadingSavedProjects
                    ? "..."
                    : savedProjects.length}
                </strong>

                <small>
                  {savedProjects.length === 1
                    ? "Project bookmarked"
                    : "Projects bookmarked"}
                </small>

              </div>

              <Link
                to="/saved-projects"
                className="career-stat-link"
              >
                View →
              </Link>

            </div>

          </div>


          {/* OVERALL PROGRESS */}

          <div className="career-progress-box">

            <div className="career-progress-header">

              <div>

                <span>
                  Overall Learning Progress
                </span>

                <p>
                  Based on your skill assessment
                  and learning roadmap.
                </p>

              </div>

              <strong>
                {analytics && roadmap
                  ? `${overallProgress}%`
                  : "--"}
              </strong>

            </div>


            <div className="career-progress-bar">

              <div
                className="career-progress-fill"
                style={{
                  width:
                    analytics && roadmap
                      ? `${overallProgress}%`
                      : "0%"
                }}
              ></div>

            </div>


            <div className="career-progress-footer">

              <span>
                Assessment
              </span>

              <span>
                Roadmap
              </span>

              <span>
                Projects
              </span>

            </div>

          </div>

        </section>


        {/* =========================
            PROFILE CONTENT
        ========================= */}

        <div className="profile-content-grid">


          {/* =========================
              MAIN COLUMN
          ========================= */}

          <div className="profile-main-column">


            {/* ABOUT */}

            <section className="profile-section-card">

              <div className="profile-section-heading">

                <div>

                  <p className="section-label">
                    ABOUT ME
                  </p>

                  <h2>
                    About
                  </h2>

                </div>

              </div>

              <p className="profile-about-text">
                {user.bio ||
                  "No bio added yet. Tell the community a little about yourself."}
              </p>

            </section>


            {/* SKILLS */}

            <section className="profile-section-card">

              <p className="section-label">
                EXPERTISE
              </p>

              <h2>
                Skills & Technologies
              </h2>

              {skills.length > 0 ? (

                <div className="profile-skills">

                  {skills.map((skill) => (
                    <span key={skill}>
                      {skill}
                    </span>
                  ))}

                </div>

              ) : (

                <div className="profile-empty-small">

                  <p>
                    No skills added yet.
                  </p>

                  <Link to="/edit-profile">
                    Add your skills →
                  </Link>

                </div>

              )}

            </section>


            {/* SKILL ASSESSMENT */}

            <section className="profile-section-card">

              <p className="section-label">
                SKILL DEVELOPMENT
              </p>

              <h2>
                Test Your Skills
              </h2>

              <p className="profile-about-text">
                Take a JavaScript assessment to evaluate your
                current skill level and track your progress.
              </p>

              <Link
                to="/skill-assessment"
                className="skill-assessment-button"
              >
                Take Skill Assessment →
              </Link>

            </section>


            {/* ANALYTICS */}

            <section className="profile-section-card">

              <p className="section-label">
                PERFORMANCE
              </p>

              <h2>
                Skill Analytics
              </h2>

              {loadingAnalytics ? (

                <p className="profile-muted">
                  Loading analytics...
                </p>

              ) : analytics ? (

                <div className="assessment-analytics-grid">

                  <div className="analytics-card">
                    <span>Assessments</span>
                    <strong>
                      {analytics.totalAssessments}
                    </strong>
                  </div>

                  <div className="analytics-card">
                    <span>Latest Score</span>
                    <strong>
                      {analytics.latestScore}%
                    </strong>
                  </div>

                  <div className="analytics-card">
                    <span>Highest Score</span>
                    <strong>
                      {analytics.highestScore}%
                    </strong>
                  </div>

                  <div className="analytics-card">
                    <span>Average Score</span>
                    <strong>
                      {analytics.averageScore}%
                    </strong>
                  </div>

                  <div className="analytics-card">
                    <span>Current Level</span>
                    <strong>
                      {analytics.currentLevel}
                    </strong>
                  </div>

                  <div className="analytics-card">
                    <span>Progress</span>
                    <strong>
                      {analytics.progress > 0
                        ? `+${analytics.progress}%`
                        : `${analytics.progress}%`}
                    </strong>
                  </div>

                </div>

              ) : (

                <p className="profile-muted">
                  No analytics available yet.
                </p>

              )}

            </section>


            {/* ROADMAP */}

            <section className="profile-section-card">

              <p className="section-label">
                PERSONALIZED LEARNING
              </p>

              <h2>
                Your Learning Roadmap
              </h2>

              {loadingRoadmap ||
              loadingRoadmapProgress ? (

                <p className="profile-muted">
                  Loading your roadmap...
                </p>

              ) : roadmap ? (

                <div className="learning-roadmap">


                  <div className="roadmap-summary">

                    <div>
                      <span>Skill</span>

                      <strong>
                        {roadmap.skill.toUpperCase()}
                      </strong>
                    </div>

                    <div>
                      <span>Current Level</span>

                      <strong>
                        {roadmap.level}
                      </strong>
                    </div>

                    <div>
                      <span>Assessment Score</span>

                      <strong>
                        {roadmap.percentage}%
                      </strong>
                    </div>

                  </div>


                  <div className="roadmap-progress-section">

                    <div className="roadmap-progress-header">

                      <span>
                        Learning Progress
                      </span>

                      <strong>
                        {completedCount}/
                        {roadmap.roadmap.length}
                        {" "}
                        completed
                      </strong>

                    </div>


                    <div className="roadmap-progress-bar">

                      <div
                        className="roadmap-progress-fill"
                        style={{
                          width: `${roadmapProgress}%`
                        }}
                      ></div>

                    </div>


                    <p className="roadmap-progress-text">
                      {roadmapProgress}%
                      {" "}
                      of your roadmap completed
                    </p>

                  </div>


                  <div className="roadmap-steps">

                    {roadmap.roadmap.map(
                      (step, index) => {

                        const isCompleted =
                          completedTopics.includes(step)

                        const completionDate =
                          getRoadmapCompletionDate(step)

                        return (

                          <div
                            className={`roadmap-step ${
                              isCompleted
                                ? "completed"
                                : ""
                            }`}
                            key={step}
                          >

                            <div className="roadmap-step-number">
                              {isCompleted
                                ? "✓"
                                : index + 1}
                            </div>


                            <div className="roadmap-step-content">

                              <div className="roadmap-step-main">

                                <h3>
                                  {step}
                                </h3>


                                {isCompleted &&
                                completionDate && (

                                  <p className="roadmap-completed-date">
                                    Completed on{" "}
                                    {completionDate}
                                  </p>

                                )}


                                <button
                                  type="button"
                                  className="roadmap-complete-button"
                                  onClick={() =>
                                    toggleRoadmapTopic(step)
                                  }
                                >
                                  {isCompleted
                                    ? "Completed ✓"
                                    : "Mark as Completed"}
                                </button>

                              </div>


                              {index <
                                roadmap.roadmap.length - 1 && (

                                <span className="roadmap-connector">
                                  ↓
                                </span>

                              )}

                            </div>

                          </div>

                        )
                      }
                    )}

                  </div>

                </div>

              ) : (

                <div className="profile-empty-small">

                  <p>
                    Complete a skill assessment to
                    generate your personalized roadmap.
                  </p>

                  <Link to="/skill-assessment">
                    Take Assessment →
                  </Link>

                </div>

              )}

            </section>


            {/* PERFORMANCE TREND */}

            {assessments.length > 0 && (

              <section className="profile-section-card">

                <p className="section-label">
                  PERFORMANCE TREND
                </p>

                <h2>
                  Assessment Progress
                </h2>

                <p className="profile-about-text">
                  Track how your assessment scores have
                  changed over time.
                </p>


                <div className="assessment-trend">

                  <div className="assessment-trend-chart">

                    {assessments
                      .slice()
                      .reverse()
                      .map(
                        (assessment, index) => {

                          const score =
                            Number(
                              assessment.percentage || 0
                            )

                          return (

                            <div
                              className="trend-column"
                              key={assessment._id}
                            >

                              <div className="trend-score">
                                {score}%
                              </div>

                              <div className="trend-bar-wrapper">

                                <div
                                  className="trend-bar"
                                  style={{
                                    height: `${Math.max(
                                      score,
                                      5
                                    )}%`
                                  }}
                                ></div>

                              </div>

                              <div className="trend-label">
                                Test {index + 1}
                              </div>

                            </div>

                          )
                        }
                      )}

                  </div>


                  <div className="assessment-trend-summary">

                    <div>

                      <span>
                        First Score
                      </span>

                      <strong>
                        {assessments
                          .slice()
                          .reverse()[0]
                          ?.percentage || 0}%
                      </strong>

                    </div>


                    <div>

                      <span>
                        Latest Score
                      </span>

                      <strong>
                        {assessments[0]?.percentage || 0}%
                      </strong>

                    </div>


                    <div>

                      <span>
                        Improvement
                      </span>

                      <strong>
                        {assessments.length > 1
                          ? `${
                              Number(
                                assessments[0]
                                  ?.percentage || 0
                              ) -
                              Number(
                                assessments[
                                  assessments.length - 1
                                ]?.percentage || 0
                              )
                            }%`
                          : "0%"}
                      </strong>

                    </div>

                  </div>

                </div>

              </section>

            )}


            {/* ACHIEVEMENTS */}

            <section className="profile-section-card">

              <div className="profile-section-heading">

                <div>

                  <p className="section-label">
                    ACHIEVEMENTS
                  </p>

                  <h2>
                    Your Badges
                  </h2>

                </div>

                <span className="achievement-count">
                  {unlockedAchievements}/
                  {achievements.length}
                  {" "}
                  unlocked
                </span>

              </div>


              <div className="achievements-grid">

                {achievements.map(
                  (achievement) => (

                    <div
                      key={achievement.id}
                      className={`achievement-card ${
                        achievement.unlocked
                          ? "unlocked"
                          : "locked"
                      }`}
                    >

                      <div className="achievement-icon">

                        {achievement.unlocked
                          ? achievement.icon
                          : "🔒"}

                      </div>


                      <div className="achievement-content">

                        <h3>
                          {achievement.title}
                        </h3>

                        <p>
                          {achievement.description}
                        </p>

                        <span>
                          {achievement.unlocked
                            ? "Unlocked"
                            : "Locked"}
                        </span>

                      </div>

                    </div>

                  )
                )}

              </div>

            </section>


            {/* ASSESSMENT HISTORY */}

            <section className="profile-section-card">

              <p className="section-label">
                ASSESSMENT HISTORY
              </p>

              <h2>
                My Skill Progress
              </h2>


              {loadingAssessments ? (

                <p className="profile-muted">
                  Loading assessment history...
                </p>

              ) : assessments.length === 0 ? (

                <div className="profile-empty-small">

                  <p>
                    You have not completed any
                    assessments yet.
                  </p>

                  <Link to="/skill-assessment">
                    Take your first assessment →
                  </Link>

                </div>

              ) : (

                <div className="assessment-history-list">

                  {assessments.map(
                    (assessment) => (

                      <div
                        className="assessment-history-item"
                        key={assessment._id}
                      >

                        <div>

                          <h3>
                            {assessment.skill.toUpperCase()}
                          </h3>

                          <p>
                            Score:{" "}
                            {assessment.score}/
                            {assessment.totalQuestions}
                          </p>

                          <span>
                            {new Date(
                              assessment.createdAt
                            ).toLocaleDateString()}
                          </span>

                        </div>


                        <div className="assessment-history-result">

                          <strong>
                            {assessment.percentage}%
                          </strong>

                          <span>
                            {assessment.level}
                          </span>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </section>


            {/* MY PROJECTS */}

            <section className="profile-section-card">

              <div className="profile-project-heading">

                <div>

                  <p className="section-label">
                    PORTFOLIO
                  </p>

                  <h2>
                    My Projects
                  </h2>

                </div>

                <Link to="/my-projects">
                  Manage →
                </Link>

              </div>


              {loadingProjects ? (

                <p className="profile-muted">
                  Loading projects...
                </p>

              ) : projects.length === 0 ? (

                <div className="profile-project-empty">

                  <div>
                    <span>✦</span>
                  </div>

                  <h3>
                    Your portfolio starts here.
                  </h3>

                  <p>
                    Create your first project and
                    showcase your work.
                  </p>

                  <Link to="/create-project">
                    Create Project →
                  </Link>

                </div>

              ) : (

                <div className="profile-project-list">

                  {projects
                    .slice(0, 3)
                    .map((project) => {

                      const imageUrl =
                        project.image?.startsWith("http")
                          ? project.image
                          : `https://BuildOrbit-backend-puyd.onrender.com${project.image}`

                      return (

                        <Link
                          key={project._id}
                          to={`/project/${project._id}`}
                          className="profile-project-item"
                        >

                          {project.image ? (

                            <img
                              src={imageUrl}
                              alt={project.title}
                            />

                          ) : (

                            <div className="profile-project-placeholder">
                              ◇
                            </div>

                          )}


                          <div>

                            <h3>
                              {project.title}
                            </h3>

                            <p>
                              {project.description}
                            </p>

                            <span>
                              ❤️{" "}
                              {project.likes || 0}
                              {"  "}
                              ·
                              {"  "}
                              💬{" "}
                              {project.comments?.length || 0}
                            </span>

                          </div>

                        </Link>

                      )
                    })}

                </div>

              )}


              {projects.length > 3 && (

                <Link
                  to="/my-projects"
                  className="view-all-projects"
                >
                  View all{" "}
                  {projects.length}
                  {" "}
                  projects →
                </Link>

              )}

            </section>

          </div>


          {/* =========================
              RIGHT SIDEBAR
          ========================= */}

          <aside className="profile-sidebar">


            {/* ACTIVITY */}

            <section className="profile-side-card">

              <p className="section-label">
                ACTIVITY
              </p>

              <div className="profile-stats-list">

                <div>

                  <strong>
                    {projects.length}
                  </strong>

                  <span>
                    Projects
                  </span>

                </div>


                <div>

                  <strong>
                    {projects.reduce(
                      (total, project) =>
                        total +
                        (project.likes || 0),
                      0
                    )}
                  </strong>

                  <span>
                    Likes received
                  </span>

                </div>


                <div>

                  <strong>
                    {skills.length}
                  </strong>

                  <span>
                    Skills
                  </span>

                </div>


                <div>

                  <strong>
                    {loadingSavedProjects
                      ? "..."
                      : savedProjects.length}
                  </strong>

                  <span>
                    Saved Projects
                  </span>

                </div>

              </div>

            </section>


            {/* SAVED PROJECTS */}

            <section className="profile-side-card">

              <p className="section-label">
                BOOKMARKS
              </p>

              <h3>
                Saved Projects
              </h3>

              <p className="profile-about-text">
                Quickly access the projects you
                bookmarked for later.
              </p>

              <Link
                to="/saved-projects"
                className="skill-assessment-button"
              >
                View Saved Projects →
              </Link>

            </section>


            {/* SOCIAL LINKS */}

            <section className="profile-side-card">

              <p className="section-label">
                CONNECT
              </p>

              <h3>
                Find me online
              </h3>

              <div className="profile-social-links">


                {user.github ? (

                  <a
                    href={user.github}
                    target="_blank"
                    rel="noreferrer"
                  >

                    <span>
                      GH
                    </span>

                    GitHub

                    <b>
                      ↗
                    </b>

                  </a>

                ) : null}


                {user.linkedin ? (

                  <a
                    href={user.linkedin}
                    target="_blank"
                    rel="noreferrer"
                  >

                    <span>
                      in
                    </span>

                    LinkedIn

                    <b>
                      ↗
                    </b>

                  </a>

                ) : null}


                {!user.github &&
                  !user.linkedin && (

                    <div className="profile-empty-links">

                      <p>
                        No social links added.
                      </p>

                      <Link to="/edit-profile">
                        Add links →
                      </Link>

                    </div>

                  )}

              </div>

            </section>

          </aside>

        </div>

      </div>

    </main>
  )
}

export default Profile