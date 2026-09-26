import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import "./UserProfile.css"

function UserProfile() {
  const { id } = useParams()

  const [user, setUser] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userResponse, projectsResponse] =
          await Promise.all([
           fetch(
            `http://localhost:5000/api/auth/users/${id}`
          ),
          fetch(
            "http://localhost:5000/api/projects"
          )
          ])

        const userData =
          await userResponse.json()

        const projectsData =
          await projectsResponse.json()

        if (!userResponse.ok) {
          throw new Error(userData.message)
        }

        if (!projectsResponse.ok) {
          throw new Error(projectsData.message)
        }

        setUser(userData)

        const userProjects =
          projectsData.filter(
            (project) =>
              project.owner?._id === id
          )

        setProjects(userProjects)
      } catch (error) {
        console.error(
          "User profile error:",
          error
        )
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [id])

  if (loading) {
    return (
      <main className="profile-page">
        <section className="profile-card profile-state">
          <div className="profile-state-icon">
            ◌
          </div>

          <h1>Loading profile...</h1>

          <p>
            Getting community member details.
          </p>
        </section>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="profile-page">
        <section className="profile-card profile-state">
          <div className="profile-state-icon">
            ?
          </div>

          <h1>User not found</h1>

          <p>
            This community profile is no longer available.
          </p>

          <Link
            to="/explore"
            className="profile-back-link"
          >
            ← Back to Explore
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

  return (
    <main className="profile-page">

      <section className="profile-card">

        {/* =========================
            PROFILE HERO
        ========================= */}

        <section className="profile-hero">

          <div className="profile-avatar">
            {user.name
              ?.charAt(0)
              .toUpperCase()}
          </div>

          <div className="profile-identity">

            <p className="section-label">
              COMMUNITY MEMBER
            </p>

            <h1>
              {user.name}
            </h1>

            <div className="profile-role-badge">
              <span className="role-dot"></span>

              {user.role === "developer"
                ? "Developer"
                : "Creator"}
            </div>

            <p className="profile-bio">
              {user.bio ||
                "Building ideas, learning technologies and creating meaningful digital experiences."}
            </p>

            <div className="profile-socials">

              {user.github && (
                <a
                  href={user.github}
                  target="_blank"
                  rel="noreferrer"
                  className="profile-social-button"
                >
                  <span>↗</span>
                  GitHub
                </a>
              )}

              {user.linkedin && (
                <a
                  href={user.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="profile-social-button"
                >
                  <span>↗</span>
                  LinkedIn
                </a>
              )}

            </div>

          </div>

        </section>


        {/* =========================
            PROFILE STATS
        ========================= */}

        <section className="profile-stats">

          <div className="profile-stat">
            <strong>
              {projects.length}
            </strong>

            <span>
              Projects
            </span>
          </div>

          <div className="profile-stat-divider"></div>

          <div className="profile-stat">
            <strong>
              {skills.length}
            </strong>

            <span>
              Skills
            </span>
          </div>

          <div className="profile-stat-divider"></div>

          <div className="profile-stat">
            <strong>
              {user.role === "developer"
                ? "DEV"
                : "CRT"}
            </strong>

            <span>
              Role
            </span>
          </div>

        </section>


        {/* =========================
            SKILLS
        ========================= */}

        <section className="profile-section">

          <div className="profile-section-heading">

            <div>
              <p className="section-label">
                EXPERTISE
              </p>

              <h2>
                Skills & Technologies
              </h2>
            </div>

            <span className="section-count">
              {skills.length}
            </span>

          </div>

          {skills.length > 0 ? (
            <div className="skills-list">

              {skills.map((skill) => (
                <span key={skill}>
                  <i></i>
                  {skill}
                </span>
              ))}

            </div>
          ) : (
            <div className="profile-empty">
              No skills added yet.
            </div>
          )}

        </section>


        {/* =========================
            PROJECTS
        ========================= */}

        <section className="profile-section projects-section">

          <div className="profile-section-heading">

            <div>
              <p className="section-label">
                WORK & BUILDS
              </p>

              <h2>
                Projects
              </h2>
            </div>

            <span className="section-count">
              {projects.length}
            </span>

          </div>


          {projects.length === 0 ? (

            <div className="profile-empty projects-empty">

              <div className="empty-project-icon">
                ◇
              </div>

              <h3>
                No projects yet
              </h3>

              <p>
                This community member hasn't
                created any projects yet.
              </p>

            </div>

          ) : (

            <div className="my-projects-list">

              {projects.map((project) => (

                <article
                  className="my-project-card"
                  key={project._id}
                >

                  {project.image && (
                    <div className="project-image-wrapper">

                      <img
                        src={
                          project.image.startsWith(
                            "http"
                          )
                            ? project.image
                            : `http://localhost:5000${project.image}`
                        }
                        alt={project.title}
                        className="my-project-image"
                      />

                      <div className="project-image-overlay">
                        View Build →
                      </div>

                    </div>
                  )}

                  <div className="project-card-content">

                    <div className="project-card-top">

                      <span className="project-number">
                        PROJECT
                      </span>

                    </div>

                    <h3>
                      {project.title}
                    </h3>

                    <p className="project-description">
                      {project.description}
                    </p>

                    {project.tech && (
                      <div className="project-tech-list">

                        {project.tech
                          .split(",")
                          .map((tech) => (
                            <span key={tech}>
                              {tech.trim()}
                            </span>
                          ))}

                      </div>
                    )}

                    <Link
                      to={`/project/${project._id}`}
                      className="edit-profile-btn"
                    >
                      View Project
                      <span>→</span>
                    </Link>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

      </section>

    </main>
  )
}

export default UserProfile