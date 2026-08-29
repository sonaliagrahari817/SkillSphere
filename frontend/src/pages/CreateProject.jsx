import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import "./CreateProject.css"

function CreateProject() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tech, setTech] = useState("")
  const [github, setGithub] = useState("")
  const [liveDemo, setLiveDemo] = useState("")

  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState("")

  const [loading, setLoading] = useState(false)

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

    setImagePreview(
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

    if (!image) {
      showToast(
        "Please select a project image",
        "error"
      )
      return
    }

    setLoading(true)

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
      formData.append("image", image)

      const response = await fetch(
        "https://skillsphere-backend-puyd.onrender.com/api/projects",
        {
          method: "POST",

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
        "Project created successfully!",
        "success"
      )

      navigate("/my-projects")
    } catch (error) {
      console.error(
        "Create project error:",
        error
      )

      showToast(
        "Unable to connect to server",
        "error"
      )
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <main className="create-project-page">

        <section className="create-project-state">

          <h1>
            Please login first
          </h1>

          <p>
            You need to login to create
            a project.
          </p>

        </section>

      </main>
    )
  }

  return (
    <main className="create-project-page">

      <div className="create-project-container">

        {/* HEADER */}

        <div className="create-project-header">

          <p className="section-label">
            BUILD SOMETHING
          </p>

          <h1>
            Create your project
          </h1>

          <p>
            Turn your work into a showcase
            the SkillSphere community can
            discover.
          </p>

        </div>


        {/* FORM */}

        <section className="create-project-card">

          <form onSubmit={handleSubmit}>

            {/* TITLE */}

            <div className="create-field">

              <label>
                Project Title
              </label>

              <input
                type="text"
                placeholder="e.g. AI Study Assistant"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                required
              />

            </div>


            {/* DESCRIPTION */}

            <div className="create-field">

              <label>
                Project Description
              </label>

              <textarea
                placeholder="What does your project do? What problem does it solve?"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                required
              />

            </div>


            {/* TECH */}

            <div className="create-field">

              <label>
                Tech Stack
              </label>

              <input
                type="text"
                placeholder="React, Node.js, MongoDB"
                value={tech}
                onChange={(e) =>
                  setTech(e.target.value)
                }
              />

              <small>
                Separate technologies with commas.
              </small>

            </div>


            {/* LINKS */}

            <div className="create-links-grid">

              <div className="create-field">

                <label>
                  GitHub Link
                </label>

                <input
                  type="url"
                  placeholder="https://github.com/username/project"
                  value={github}
                  onChange={(e) =>
                    setGithub(e.target.value)
                  }
                />

              </div>


              <div className="create-field">

                <label>
                  Live Demo
                </label>

                <input
                  type="url"
                  placeholder="https://your-project.com"
                  value={liveDemo}
                  onChange={(e) =>
                    setLiveDemo(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>


            {/* IMAGE */}

            <div className="create-field">

              <label>
                Project Image
              </label>

              <label className="image-upload-box">

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                />

                <span className="upload-icon">
                  ↑
                </span>

                <strong>
                  {image
                    ? image.name
                    : "Choose project image"}
                </strong>

                <small>
                  PNG, JPG or WEBP · Maximum 5MB
                </small>

              </label>

            </div>


            {/* PREVIEW */}

            {imagePreview && (
              <div className="create-image-preview">

                <div className="preview-heading">

                  <span>
                    IMAGE PREVIEW
                  </span>

                  <span>
                    Looks good?
                  </span>

                </div>

                <img
                  src={imagePreview}
                  alt="Project preview"
                />

              </div>
            )}


            {/* SUBMIT */}

            <button
              type="submit"
              className="create-project-submit"
              disabled={loading}
            >
              {loading
                ? "Creating Project..."
                : "Create Project →"}
            </button>

          </form>

        </section>

      </div>

    </main>
  )
}

export default CreateProject