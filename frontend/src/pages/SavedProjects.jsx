import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import "./SavedProjects.css"
function SavedProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState(null)

  // =========================
  // FETCH SAVED PROJECTS
  // =========================

  const fetchSavedProjects = async () => {
    try {
      const token =
        localStorage.getItem("token")

      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch(
        "http://localhost:5000/api/projects/saved/my-projects",
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch saved projects"
        )
      }

      setProjects(
        data.savedProjects || []
      )

    } catch (error) {
      console.error(
        "Saved projects error:",
        error
      )
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchSavedProjects()
  }, [])


  // =========================
  // REMOVE SAVED PROJECT
  // =========================

  const handleRemove = async (projectId) => {
    const token =
      localStorage.getItem("token")

    if (!token) {
      return
    }

    setRemovingId(projectId)

    try {
      const response = await fetch(
        `http://localhost:5000/api/projects/${projectId}/save`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to remove project"
        )
      }

      setProjects((currentProjects) =>
        currentProjects.filter(
          (project) =>
            project._id !== projectId
        )
      )

    } catch (error) {
      console.error(
        "Remove saved project error:",
        error
      )

      alert(
        error.message ||
          "Something went wrong"
      )
    } finally {
      setRemovingId(null)
    }
  }


  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="saved-projects-page">

        <div className="saved-projects-container">

          <div className="saved-projects-header">
            <p className="section-label">
              YOUR COLLECTION
            </p>

            <h1>
              Saved Projects
            </h1>

            <p>
              Loading your saved projects...
            </p>
          </div>

        </div>

      </main>
    )
  }


  return (
    <main className="saved-projects-page">

      <div className="saved-projects-container">


        {/* =========================
            HEADER
        ========================= */}

        <section className="saved-projects-header">

          <div>

            <p className="section-label">
              YOUR COLLECTION
            </p>

            <h1>
              Saved Projects
            </h1>

            <p>
              Keep track of projects you want
              to explore later.
            </p>

          </div>

          <div className="saved-projects-count">
            {projects.length}
            {" "}
            {projects.length === 1
              ? "Project"
              : "Projects"}
          </div>

        </section>


        {/* =========================
            EMPTY STATE
        ========================= */}

        {projects.length === 0 ? (

          <section className="saved-projects-empty">

            <div className="saved-empty-icon">
              🔖
            </div>

            <h2>
              No saved projects yet
            </h2>

            <p>
              When you find an interesting project,
              save it and it will appear here.
            </p>

            <Link
              to="/explore"
              className="saved-explore-button"
            >
              Explore Projects →
            </Link>

          </section>

        ) : (


          /* =========================
             PROJECT GRID
          ========================= */

          <div className="saved-projects-grid">

            {projects.map((project) => {

              const imageUrl =
                project.image?.startsWith(
                  "http"
                )
                  ? project.image
                  : `http://localhost:5000${project.image}`

              return (

                <article
                  className="saved-project-card"
                  key={project._id}
                >

                  {/* IMAGE */}

                  {project.image ? (

                    <img
                      src={imageUrl}
                      alt={project.title}
                      className="saved-project-image"
                    />

                  ) : (

                    <div className="saved-project-placeholder">
                      ◇
                    </div>

                  )}


                  {/* CONTENT */}

                  <div className="saved-project-content">

                    <div className="saved-project-title-row">

                      <h2>
                        {project.title}
                      </h2>

                      <span className="saved-badge">
                        🔖 Saved
                      </span>

                    </div>


                    <p className="saved-project-description">
                      {project.description}
                    </p>


                    {project.tech && (

                      <p className="saved-project-tech">
                        {project.tech}
                      </p>

                    )}


                    {project.owner && (

                      <p className="saved-project-owner">
                        By{" "}
                        <strong>
                          {project.owner.name}
                        </strong>
                      </p>

                    )}


                    <div className="saved-project-actions">

                      <Link
                        to={`/project/${project._id}`}
                        className="saved-view-button"
                      >
                        View Project
                      </Link>


                      <button
                        type="button"
                        className="saved-remove-button"
                        onClick={() =>
                          handleRemove(
                            project._id
                          )
                        }
                        disabled={
                          removingId ===
                          project._id
                        }
                      >
                        {removingId ===
                        project._id
                          ? "Removing..."
                          : "Remove"}
                      </button>

                    </div>

                  </div>

                </article>

              )
            })}

          </div>

        )}

      </div>

    </main>
  )
}

export default SavedProjects