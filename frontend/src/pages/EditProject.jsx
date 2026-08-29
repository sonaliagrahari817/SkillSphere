import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"

function EditProject() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tech, setTech] = useState("")
  const [github, setGithub] = useState("")
  const [liveDemo, setLiveDemo] = useState("")

  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState("")

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchProject = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/projects/${id}`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message)
        }

        setTitle(data.title || "")
        setDescription(data.description || "")
        setTech(data.tech || "")
        setGithub(data.github || "")
        setLiveDemo(data.liveDemo || "")

        if (data.image) {
          setPreview(
            `http://localhost:5000${data.image}`
          )
        }
      } catch (error) {
        console.error(
          "Fetch project error:",
          error
        )

        showToast(
          "Unable to load project",
          "error"
        )
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id, user, showToast])

  const handleImageChange = (e) => {
    const file = e.target.files[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      showToast(
        "Please select a valid image",
        "error"
      )
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast(
        "Image must be smaller than 5MB",
        "error"
      )
      return
    }

    setImage(file)

    setPreview(
      URL.createObjectURL(file)
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      showToast(
        "Please login first",
        "error"
      )
      navigate("/login")
      return
    }

    const token = localStorage.getItem("token")

    if (!token) {
      showToast(
        "Please login again",
        "error"
      )
      navigate("/login")
      return
    }

    setSaving(true)

    try {
      const formData = new FormData()

      formData.append("title", title)
      formData.append(
        "description",
        description
      )
      formData.append("tech", tech)
      formData.append("github", github)
      formData.append(
        "liveDemo",
        liveDemo
      )

      if (image) {
        formData.append("image", image)
      }

      const response = await fetch(
        `http://localhost:5000/api/projects/${id}`,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${token}`
          },

          body: formData
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

      showToast(
        "Project updated successfully!",
        "success"
      )

      navigate("/my-projects")
    } catch (error) {
      console.error(
        "Update project error:",
        error
      )

      showToast(
        "Unable to update project",
        "error"
      )
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <main className="profile-page">
        <section className="profile-card">
          <h1>Please login first</h1>

          <p>
            You need to login to edit your
            project.
          </p>
        </section>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="profile-page">
        <section className="profile-card">
          <h1>Loading project...</h1>
        </section>
      </main>
    )
  }

  return (
    <main className="profile-page">

      <section className="profile-card edit-profile-card">

        <p className="section-label">
          PROJECT SETTINGS
        </p>

        <h1>Edit Project</h1>

        <p className="profile-bio">
          Update your project information.
        </p>

        <form onSubmit={handleSubmit}>

          {/* TITLE */}

          <label>
            Project Title
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            required
          />


          {/* DESCRIPTION */}

          <label>
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            required
          />


          {/* TECH */}

          <label>
            Tech Stack
          </label>

          <input
            type="text"
            value={tech}
            onChange={(e) =>
              setTech(e.target.value)
            }
            placeholder="React, Node.js, MongoDB"
          />


          {/* GITHUB */}

          <label>
            GitHub
          </label>

          <input
            type="url"
            value={github}
            onChange={(e) =>
              setGithub(e.target.value)
            }
            placeholder="https://github.com/username/project"
          />


          {/* LIVE DEMO */}

          <label>
            Live Demo
          </label>

          <input
            type="url"
            value={liveDemo}
            onChange={(e) =>
              setLiveDemo(e.target.value)
            }
            placeholder="https://your-project.com"
          />


          {/* IMAGE */}

          <label>
            Project Image
          </label>

          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleImageChange}
          />

          {preview && (
            <div
              style={{
                marginTop: "12px"
              }}
            >
              <img
                src={preview}
                alt="Project preview"
                style={{
                  width: "100%",
                  maxHeight: "250px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  display: "block"
                }}
              />
            </div>
          )}


          {/* BUTTON */}

          <button
            type="submit"
            className="auth-submit"
            disabled={saving}
          >
            {saving
              ? "Saving Changes..."
              : "Save Changes"}
          </button>

        </form>

      </section>

    </main>
  )
}

export default EditProject