import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "./Profile.css"

function Profile() {
  const { user } = useAuth()

  const [projects, setProjects] = useState([])
  const [loadingProjects, setLoadingProjects] =
    useState(false)

  useEffect(() => {
    const fetchMyProjects = async () => {
      if (!user) {
        return
      }

      setLoadingProjects(true)

      try {
        const response = await fetch(
          "https://skillsphere-backend-puyd.onrender.com/api/projects"
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

  if (!user) {
    return (
      <main className="profile-page-new">
        <section className="profile-state">
          <div className="profile-state-icon">
            ◇
          </div>

          <h1>Please login first</h1>

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

  return (
    <main className="profile-page-new">

      <div className="profile-container">

        {/* PROFILE HERO */}

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

              <h1>{user.name}</h1>

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


        {/* PROFILE CONTENT */}

        <div className="profile-content-grid">

          {/* LEFT */}

          <div className="profile-main-column">

            {/* ABOUT */}

            <section className="profile-section-card">

              <div className="profile-section-heading">

                <div>
                  <p className="section-label">
                    ABOUT ME
                  </p>

                  <h2>About</h2>
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

              <h2>Skills & Technologies</h2>

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


            {/* PROJECTS */}

            <section className="profile-section-card">

              <div className="profile-project-heading">

                <div>

                  <p className="section-label">
                    PORTFOLIO
                  </p>

                  <h2>My Projects</h2>

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

                  {projects.slice(0, 3).map(
                    (project) => {

                      const imageUrl =
                        project.image?.startsWith("http")
                          ? project.image
                          : `https://skillsphere-backend-puyd.onrender.com${project.image}`

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
                              ❤️ {project.likes || 0}
                              {"  "}
                              ·
                              {"  "}
                              💬{" "}
                              {project.comments
                                ?.length || 0}
                            </span>

                          </div>

                        </Link>
                      )
                    }
                  )}

                </div>
              )}

              {projects.length > 3 && (
                <Link
                  to="/my-projects"
                  className="view-all-projects"
                >
                  View all {projects.length} projects →
                </Link>
              )}

            </section>

          </div>


          {/* RIGHT SIDEBAR */}

          <aside className="profile-sidebar">

            {/* STATS */}

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

              </div>

            </section>


            {/* LINKS */}

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
                    <span>GH</span>
                    GitHub
                    <b>↗</b>
                  </a>
                ) : null}

                {user.linkedin ? (
                  <a
                    href={user.linkedin}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>in</span>
                    LinkedIn
                    <b>↗</b>
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