import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

function ProjectCard({
  id,
  title,
  description,
  tech,
  image
}) {
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const imageUrl = image?.startsWith("http")
    ? image
    : `${import.meta.env.VITE_API_URL}${image}`


  // =========================
  // CHECK SAVED STATUS
  // =========================

  useEffect(() => {
    const checkSavedStatus = async () => {
      const token =
        localStorage.getItem("token")

      if (!token || !id) {
        return
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/projects/saved/my-projects`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        )

        if (!response.ok) {
          return
        }

        const data =
          await response.json()

        const savedProjects =
          data.savedProjects || []

        const isSaved =
          savedProjects.some(
            (project) =>
              project._id === id
          )

        setSaved(isSaved)

      } catch (error) {
        console.error(
          "Saved status error:",
          error
        )
      }
    }

    checkSavedStatus()
  }, [id])


  // =========================
  // SAVE / UNSAVE PROJECT
  // =========================

  const handleSave = async () => {
    const token =
      localStorage.getItem("token")

    if (!token) {
      alert(
        "Please login to save projects."
      )
      return
    }

    if (saving) {
      return
    }

    setSaving(true)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/projects/${id}/save`,
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
            "Failed to save project"
        )
      }

      setSaved(
        data.saved === true
      )

    } catch (error) {

      console.error(
        "Save project error:",
        error
      )

      alert(
        error.message ||
          "Something went wrong"
      )

    } finally {
      setSaving(false)
    }
  }


  return (
    <div className="project-card">

      {image && (
        <img
          src={imageUrl}
          alt={title}
          className="project-card-image"
        />
      )}


      <div className="project-card-content">

        <div className="project-card-top">

          <h3>
            {title}
          </h3>

          <button
            type="button"
            className={`project-save-btn ${
              saved ? "saved" : ""
            }`}
            onClick={handleSave}
            disabled={saving}
            title={
              saved
                ? "Remove from saved"
                : "Save project"
            }
          >
            {saving
              ? "..."
              : saved
                ? "🔖"
                : "♡"}
          </button>

        </div>


        <p>
          {description}
        </p>


        <p>
          {tech}
        </p>


        <Link
          to={`/project/${id}`}
          className="project-view-btn"
        >
          View Project
        </Link>

      </div>

    </div>
  )
}

export default ProjectCard