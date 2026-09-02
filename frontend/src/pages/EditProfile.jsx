import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import "./EditProfile.css"

function EditProfile() {
  const { user, login } = useAuth()
  const { showToast } = useToast()

  const [name, setName] = useState(user?.name || "")
  const [bio, setBio] = useState(user?.bio || "")
  const [skills, setSkills] = useState(user?.skills || "")
  const [github, setGithub] = useState(user?.github || "")
  const [linkedin, setLinkedin] = useState(user?.linkedin || "")

  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim()) {
      showToast("Name is required", "error")
      return
    }

    try {
      setSaving(true)

      const response = await fetch(
        `https://skillsphere-backend-puyd.onrender.com/api/auth/profile/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            name: name.trim(),
            bio: bio.trim(),
            skills: skills.trim(),
            github: github.trim(),
            linkedin: linkedin.trim()
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        showToast(
          data.message || "Failed to update profile",
          "error"
        )
        return
      }

      if (data.user) {
        login(data.user)
      }

      showToast(
        "Profile updated successfully!",
        "success"
      )
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      )

      showToast(
        "Unable to connect to server",
        "error"
      )
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <main className="edit-profile-page">
        <section className="edit-profile-state">
          <h1>Please login first</h1>

          <p>
            You need to login to edit your profile.
          </p>

          <Link to="/login">
            Login →
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="edit-profile-page">
      <div className="edit-profile-container">

        {/* TOP */}

        <div className="edit-profile-top">

          <Link
            to="/profile"
            className="edit-back-link"
          >
            ← Back to Profile
          </Link>

          <p className="section-label">
            PROFILE SETTINGS
          </p>

          <h1>
            Shape your profile.
          </h1>

          <p>
            Tell the SkillSphere community who
            you are and what you build.
          </p>

        </div>


        {/* FORM CARD */}

        <section className="edit-profile-layout">

          <div className="edit-profile-form-card">

            <form onSubmit={handleSubmit}>

              {/* BASIC INFO */}

              <div className="edit-form-section">

                <div className="edit-form-heading">

                  <span>01</span>

                  <div>

                    <h2>
                      Basic Information
                    </h2>

                    <p>
                      Your public identity on SkillSphere.
                    </p>

                  </div>

                </div>


                <div className="edit-form-field">

                  <label htmlFor="profile-name">
                    Full Name
                  </label>

                  <input
                    id="profile-name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    required
                  />

                </div>


                <div className="edit-form-field">

                  <label htmlFor="profile-email">
                    Email
                  </label>

                  <input
                    id="profile-email"
                    type="email"
                    value={user.email}
                    disabled
                  />

                  <small>
                    Your email is connected to your
                    account and cannot be changed here.
                  </small>

                </div>

              </div>


              {/* ABOUT */}

              <div className="edit-form-section">

                <div className="edit-form-heading">

                  <span>02</span>

                  <div>

                    <h2>
                      About You
                    </h2>

                    <p>
                      Give people a reason to know
                      more about you.
                    </p>

                  </div>

                </div>


                <div className="edit-form-field">

                  <label htmlFor="profile-bio">
                    Bio
                  </label>

                  <textarea
                    id="profile-bio"
                    placeholder="Tell us about yourself, what you build, or what you're passionate about..."
                    value={bio}
                    onChange={(e) =>
                      setBio(e.target.value)
                    }
                    rows="6"
                  />

                  <small>
                    Keep it short, personal and
                    meaningful.
                  </small>

                </div>

              </div>


              {/* SKILLS */}

              <div className="edit-form-section">

                <div className="edit-form-heading">

                  <span>03</span>

                  <div>

                    <h2>
                      Skills
                    </h2>

                    <p>
                      Add technologies you work with.
                    </p>

                  </div>

                </div>


                <div className="edit-form-field">

                  <label htmlFor="profile-skills">
                    Skills & Technologies
                  </label>

                  <input
                    id="profile-skills"
                    type="text"
                    placeholder="React, JavaScript, Node.js, MongoDB"
                    value={skills}
                    onChange={(e) =>
                      setSkills(e.target.value)
                    }
                  />

                  <small>
                    Separate multiple skills with
                    commas.
                  </small>

                </div>

              </div>


              {/* SOCIAL */}

              <div className="edit-form-section">

                <div className="edit-form-heading">

                  <span>04</span>

                  <div>

                    <h2>
                      Social Links
                    </h2>

                    <p>
                      Let people discover your work.
                    </p>

                  </div>

                </div>


                <div className="edit-form-field">

                  <label htmlFor="profile-github">
                    GitHub
                  </label>

                  <input
                    id="profile-github"
                    type="url"
                    placeholder="https://github.com/username"
                    value={github}
                    onChange={(e) =>
                      setGithub(e.target.value)
                    }
                  />

                </div>


                <div className="edit-form-field">

                  <label htmlFor="profile-linkedin">
                    LinkedIn
                  </label>

                  <input
                    id="profile-linkedin"
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={linkedin}
                    onChange={(e) =>
                      setLinkedin(e.target.value)
                    }
                  />

                </div>

              </div>


              {/* BUTTONS */}

              <div className="edit-profile-actions">

                <Link
                  to="/profile"
                  className="cancel-profile-button"
                >
                  Cancel
                </Link>


                <button
                  type="submit"
                  className="save-profile-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes →"}
                </button>

              </div>

            </form>

          </div>


          {/* PREVIEW */}

          <aside className="profile-preview-card">

            <p className="section-label">
              PREVIEW
            </p>


            <div className="preview-avatar">

              {name
                ?.charAt(0)
                .toUpperCase() || "?"}

            </div>


            <h3>
              {name || "Your Name"}
            </h3>


            <span className="preview-role">

              {user.role === "developer"
                ? "Developer"
                : "Creator"}

            </span>


            <p className="preview-bio">

              {bio ||
                "Your bio will appear here."}

            </p>


            <div className="preview-skills">

              {skills
                ? skills
                    .split(",")
                    .map((skill) => skill.trim())
                    .filter(Boolean)
                    .slice(0, 5)
                    .map((skill) => (
                      <span key={skill}>
                        {skill}
                      </span>
                    ))
                : (
                  <span>
                    Your skills
                  </span>
                )}

            </div>

          </aside>

        </section>

      </div>
    </main>
  )
}

export default EditProfile