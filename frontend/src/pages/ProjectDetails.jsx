import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import "./ProjectDetails.css"

function ProjectDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  const [comment, setComment] = useState("")
  const [comments, setComments] = useState([])
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/projects/${id}`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message)
        }

        setProject(data)
        setLikes(data.likes || 0)
        setComments(data.comments || [])

        const token = localStorage.getItem("token")

        if (token && data.likedBy && user?.id) {
          setLiked(
            data.likedBy.some(
              (userId) =>
                userId.toString() === user.id.toString()
            )
          )
        } else {
          setLiked(false)
        }
      } catch (error) {
        console.error(
          "Fetch project error:",
          error
        )
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id, user])

  const handleLike = async () => {
    if (!user) {
      showToast(
        "Please login to like a project",
        "error"
      )
      return
    }

    const token = localStorage.getItem("token")

    if (!token) {
      showToast(
        "Please login again",
        "error"
      )
      return
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/projects/${id}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        showToast(
          data.message,
          "error"
        )
        return
      }

      setLikes(data.likes)
      setLiked(data.liked)
    } catch (error) {
      console.error(
        "Like error:",
        error
      )

      showToast(
        "Unable to update like",
        "error"
      )
    }
  }

  const handleAddComment = async () => {
    if (!user) {
      showToast(
        "Please login to comment",
        "error"
      )
      return
    }

    if (comment.trim() === "") {
      return
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/projects/${id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: user.name,
            text: comment.trim()
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        showToast(
          data.message,
          "error"
        )
        return
      }

      setComments(data.comments)
      setComment("")
    } catch (error) {
      console.error(
        "Comment error:",
        error
      )

      showToast(
        "Unable to add comment",
        "error"
      )
    }
  }

  if (loading) {
    return (
      <main className="project-details-page">
        <section className="project-details-state">
          <div className="details-loader"></div>

          <h2>
            Loading project...
          </h2>

          <p>
            Getting the project details for you.
          </p>
        </section>
      </main>
    )
  }

  if (!project) {
    return (
      <main className="project-details-page">
        <section className="project-details-state">

          <div className="details-empty-icon">
            ◇
          </div>

          <h2>
            Project not found
          </h2>

          <p>
            This project may have been deleted
            or is no longer available.
          </p>

          <Link to="/explore">
            ← Back to Explore
          </Link>

        </section>
      </main>
    )
  }

  const techStack = project.tech
    ? project.tech
        .split(",")
        .map((tech) => tech.trim())
        .filter(Boolean)
    : []

  return (
    <main className="project-details-page">

      <div className="project-details-container">

        {/* BACK */}

        <Link
          to="/explore"
          className="back-to-explore"
        >
          ← Back to Explore
        </Link>


        {/* HERO */}

        <section className="project-showcase">

          <div className="project-showcase-content">

            <div className="project-showcase-copy">

              <p className="section-label">
                PROJECT SHOWCASE
              </p>

              <h1>
                {project.title}
              </h1>

              <p className="project-details-description">
                {project.description}
              </p>

              {techStack.length > 0 && (
                <div className="details-tech-stack">

                  {techStack.map((tech) => (
                    <span key={tech}>
                      {tech}
                    </span>
                  ))}

                </div>
              )}

            </div>

            <div className="project-showcase-mark">
              <span>✦</span>
            </div>

          </div>

        </section>


        {/* IMAGE */}

        {project.image && (
          <section className="project-hero-image">

            <img
              src={`http://localhost:5000${project.image}`}
              alt={project.title}
            />

          </section>
        )}


        {/* INFO BAR */}

        <section className="project-info-bar">

          <div className="project-stats">

            <button
              type="button"
              onClick={handleLike}
              className={
                liked
                  ? "like-button liked"
                  : "like-button"
              }
            >
              <span>
                {liked ? "♥" : "♡"}
              </span>

              {likes}

              <small>
                {liked ? "Liked" : "Likes"}
              </small>
            </button>

            <div className="comment-stat">

              <span>💬</span>

              <strong>
                {comments.length}
              </strong>

              <small>
                Comments
              </small>

            </div>

          </div>


          <div className="project-actions">

            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="project-external-link"
              >
                GitHub ↗
              </a>
            )}

            {project.liveDemo && (
              <a
                href={project.liveDemo}
                target="_blank"
                rel="noreferrer"
                className="project-external-link primary-link"
              >
                Live Demo ↗
              </a>
            )}

          </div>

        </section>


        {/* MAIN CONTENT */}

        <div className="project-content-grid">

          <div className="project-content-main">

            {/* ABOUT */}

            <section className="project-about-section">

              <p className="section-label">
                ABOUT THE PROJECT
              </p>

              <h2>
                What was built?
              </h2>

              <p>
                {project.description}
              </p>

            </section>


            {/* COMMENTS */}

            <section className="project-comments">

              <div className="comments-heading">

                <div>

                  <p className="section-label">
                    COMMUNITY
                  </p>

                  <h2>
                    Comments
                  </h2>

                </div>

                <span>
                  {comments.length}
                </span>

              </div>


              {/* COMMENT FORM */}

              {user ? (
                <div className="comment-form">

                  <div className="comment-input-avatar">
                    {user.name
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>

                  <input
                    type="text"
                    placeholder="Share your thoughts about this project..."
                    value={comment}
                    onChange={(e) =>
                      setComment(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddComment()
                      }
                    }}
                  />

                  <button
                    type="button"
                    onClick={handleAddComment}
                  >
                    Comment
                  </button>

                </div>
              ) : (
                <div className="login-comment-message">

                  <p>
                    Login to join the
                    conversation.
                  </p>

                  <Link to="/login">
                    Login →
                  </Link>

                </div>
              )}


              {/* COMMENTS LIST */}

              <div className="comments-list">

                {comments.length === 0 ? (
                  <div className="no-comments">

                    <span>💬</span>

                    <h3>
                      No comments yet
                    </h3>

                    <p>
                      Be the first person to
                      share your thoughts.
                    </p>

                  </div>
                ) : (
                  comments.map(
                    (item, index) => (
                      <article
                        className="comment-item"
                        key={
                          item._id || index
                        }
                      >

                        <div className="comment-avatar">
                          {item.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="comment-content">

                          <div className="comment-author">

                            <strong>
                              {item.name}
                            </strong>

                            {item.createdAt && (
                              <span>
                                {new Date(
                                  item.createdAt
                                ).toLocaleDateString()}
                              </span>
                            )}

                          </div>

                          <p>
                            {item.text}
                          </p>

                        </div>

                      </article>
                    )
                  )
                )}

              </div>

            </section>

          </div>


          {/* SIDEBAR */}

          <aside className="project-details-sidebar">

            {/* CREATOR */}

            {project.owner && (
              <section className="creator-showcase">

                <p className="section-label">
                  CREATED BY
                </p>

                <div className="creator-profile">

                  <div className="creator-avatar">
                    {project.owner.name
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="creator-info">

                    <h3>
                      {project.owner.name}
                    </h3>

                    <p>
                      {project.owner.role ===
                      "developer"
                        ? "Developer"
                        : "Creator"}
                    </p>

                  </div>

                </div>

              </section>
            )}


            {/* TECH */}

            {techStack.length > 0 && (
              <section className="details-sidebar-card">

                <p className="section-label">
                  BUILT WITH
                </p>

                <div className="sidebar-tech-list">

                  {techStack.map((tech) => (
                    <span key={tech}>
                      {tech}
                    </span>
                  ))}

                </div>

              </section>
            )}


            {/* PROJECT LINKS */}

            {(project.github ||
              project.liveDemo) && (
              <section className="details-sidebar-card">

                <p className="section-label">
                  EXPLORE
                </p>

                <div className="sidebar-links">

                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span>
                        GitHub
                      </span>

                      <b>↗</b>
                    </a>
                  )}

                  {project.liveDemo && (
                    <a
                      href={project.liveDemo}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span>
                        Live Demo
                      </span>

                      <b>↗</b>
                    </a>
                  )}

                </div>

              </section>
            )}

          </aside>

        </div>

      </div>

    </main>
  )
}

export default ProjectDetails