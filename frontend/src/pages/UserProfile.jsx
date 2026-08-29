import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"

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

        const userData = await userResponse.json()
        const projectsData = await projectsResponse.json()

        if (!userResponse.ok) {
          throw new Error(userData.message)
        }

        if (!projectsResponse.ok) {
          throw new Error(projectsData.message)
        }

        setUser(userData)

        const userProjects = projectsData.filter(
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
        <section className="profile-card">
          <h1>Loading profile...</h1>
        </section>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="profile-page">
        <section className="profile-card">
          <h1>User not found</h1>
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

        <p className="section-label">
          COMMUNITY MEMBER
        </p>

        <h1>{user.name}</h1>

        <p className="profile-role">
          {user.role === "developer"
            ? "Developer"
            : "Creator"}
        </p>

        <p className="profile-bio">
          {user.bio || "No bio added yet."}
        </p>

        <h2>Skills</h2>

        <div className="skills-list">
          {skills.length > 0 ? (
            skills.map((skill) => (
              <span key={skill}>
                {skill}
              </span>
            ))
          ) : (
            <p>No skills added yet.</p>
          )}
        </div>

        {user.github && (
          <p>
            <a
              href={user.github}
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </p>
        )}

        {user.linkedin && (
          <p>
            <a
              href={user.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
          </p>
        )}

        <h2>Projects</h2>

        {projects.length === 0 ? (
          <p>
            This user hasn't created any projects yet.
          </p>
        ) : (
          <div className="my-projects-list">

            {projects.map((project) => (
              <article
                className="my-project-card"
                key={project._id}
              >

                {project.image && (
                  <img
                    src={`http://localhost:5000${project.image}`}
                    alt={project.title}
                    className="my-project-image"
                  />
                )}

                <h3>{project.title}</h3>

                <p>{project.description}</p>

                {project.tech && (
                  <p className="project-tech">
                    {project.tech}
                  </p>
                )}

                <Link
                  to={`/project/${project._id}`}
                  className="edit-profile-btn"
                >
                  View Project
                </Link>

              </article>
            ))}

          </div>
        )}

      </section>
    </main>
  )
}

export default UserProfile