import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import "./MyProjects.css"

function MyProjects() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  const [deleteProjectId, setDeleteProjectId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/projects"
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message)
        }

        const myProjects = data.filter(
          (project) =>
            project.owner?._id === user?.id ||
            project.owner === user?.id
        )

        setProjects(myProjects)
      } catch (error) {
        console.error(
          "Fetch projects error:",
          error
        )

        showToast(
          "Unable to load your projects",
          "error"
        )
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchProjects()
    } else {
      setLoading(false)
    }
  }, [user, showToast])

  const handleDeleteClick = (projectId) => {
    setDeleteProjectId(projectId)
  }

  const cancelDelete = () => {
    if (deleting) {
      return
    }

    setDeleteProjectId(null)
  }

  const confirmDelete = async () => {
    if (!deleteProjectId) {
      return
    }

    setDeleting(true)

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        showToast(
          "Please login again",
          "error"
        )

        setDeleteProjectId(null)
        return
      }

      const response = await fetch(
        `http://localhost:5000/api/projects/${deleteProjectId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        showToast(
          data.message || "Unable to delete project",
          "error"
        )
        return
      }

      setProjects((currentProjects) =>
        currentProjects.filter(
          (project) =>
            project._id !== deleteProjectId
        )
      )

      setDeleteProjectId(null)

      showToast(
        "Project deleted successfully!",
        "success"
      )
    } catch (error) {
      console.error(
        "Delete project error:",
        error
      )

      showToast(
        "Unable to delete project",
        "error"
      )
    } finally {
      setDeleting(false)
    }
  }

  if (!user) {
    return (
      <main className="my-projects-page">
        <section className="my-projects-state">
          <h1>Please login first</h1>

          <p>
            You need to login to view your projects.
          </p>

          <Link to="/login">
            Login →
          </Link>
        </section>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="my-projects-page">
        <section className="my-projects-state">
          <div className="my-projects-loader"></div>

          <h2>Loading your projects...</h2>

          <p>
            Getting your work ready.
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="my-projects-page">

      <div className="my-projects-container">

        <section className="my-projects-header">

          <div>
            <p className="section-label">
              YOUR WORKSPACE
            </p>

            <h1>
              My Projects
            </h1>

            <p>
              Manage and showcase everything
              you've built.
            </p>
          </div>

          <Link
            to="/create-project"
            className="create-project-button"
          >
            + Create Project
          </Link>

        </section>


        <section className="my-project-stats">

          <div className="my-project-stat">
            <strong>
              {projects.length}
            </strong>

            <span>
              {projects.length === 1
                ? "Project"
                : "Projects"}
            </span>
          </div>

          <div className="my-project-stat">
            <strong>
              {projects.reduce(
                (total, project) =>
                  total + (project.likes || 0),
                0
              )}
            </strong>

            <span>
              Total Likes
            </span>
          </div>

          <div className="my-project-stat">
            <strong>
              {projects.reduce(
                (total, project) =>
                  total +
                  (project.comments?.length || 0),
                0
              )}
            </strong>

            <span>
              Comments
            </span>
          </div>

        </section>


        {projects.length === 0 ? (
          <section className="my-projects-empty">

            <div className="empty-project-icon">
              ✦
            </div>

            <h2>
              Nothing here yet.
            </h2>

            <p>
              Create your first project and
              share it with the SkillSphere
              community.
            </p>

            <Link
              to="/create-project"
              className="create-project-button"
            >
              Create Your First Project →
            </Link>

          </section>
        ) : (

          <section className="my-project-grid">

            {projects.map((project) => (
              <article
                className="dashboard-project-card"
                key={project._id}
              >

                {project.image ? (
                  <Link
                    to={`/project/${project._id}`}
                    className="dashboard-image-link"
                  >
                    <img
                      src={`http://localhost:5000${project.image}`}
                      alt={project.title}
                      className="dashboard-project-image"
                    />

                    <span className="image-view-label">
                      View project →
                    </span>
                  </Link>
                ) : (
                  <Link
                    to={`/project/${project._id}`}
                    className="dashboard-image-placeholder"
                  >
                    <span>◇</span>
                  </Link>
                )}


                <div className="dashboard-project-body">

                  <div className="dashboard-project-title">

                    <h2>
                      {project.title}
                    </h2>

                    <span>
                      Project
                    </span>

                  </div>

                  <p className="dashboard-description">
                    {project.description}
                  </p>


                  {project.tech && (
                    <div className="dashboard-tech">

                      {project.tech
                        .split(",")
                        .slice(0, 4)
                        .map((tech) => (
                          <span
                            key={tech.trim()}
                          >
                            {tech.trim()}
                          </span>
                        ))}

                    </div>
                  )}


                  <div className="dashboard-project-meta">

                    <span>
                      ❤️ {project.likes || 0}
                    </span>

                    <span>
                      💬{" "}
                      {project.comments?.length ||
                        0}
                    </span>

                  </div>


                  <div className="dashboard-actions">

                    <Link
                      to={`/project/${project._id}`}
                      className="dashboard-view"
                    >
                      View
                    </Link>

                    <Link
                      to={`/edit-project/${project._id}`}
                      className="dashboard-edit"
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      className="dashboard-delete"
                      onClick={() =>
                        handleDeleteClick(
                          project._id
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </article>
            ))}

          </section>

        )}

      </div>


      {/* DELETE CONFIRMATION */}

      {deleteProjectId && (
        <div className="delete-modal-overlay">

          <div className="delete-modal">

            <div className="delete-modal-icon">
              !
            </div>

            <h2>
              Delete project?
            </h2>

            <p>
              Are you sure you want to delete
              this project? This action cannot
              be undone.
            </p>

            <div className="delete-modal-actions">

              <button
                type="button"
                onClick={cancelDelete}
                disabled={deleting}
                className="delete-cancel-button"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="delete-confirm-button"
              >
                {deleting
                  ? "Deleting..."
                  : "Yes, Delete"}
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  )
}

export default MyProjects