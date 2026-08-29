import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import "./Explore.css"

function Explore() {
  const [projects, setProjects] = useState([])
  const [search, setSearch] = useState("")
  const [selectedTech, setSelectedTech] = useState("All")
  const [loading, setLoading] = useState(true)

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

        setProjects(data)
      } catch (error) {
        console.error(
          "Explore projects error:",
          error
        )
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const technologies = useMemo(() => {
    const allTech = projects.flatMap((project) =>
      project.tech
        ? project.tech
            .split(",")
            .map((tech) => tech.trim())
            .filter(Boolean)
        : []
    )

    return [
      "All",
      ...new Set(allTech)
    ]
  }, [projects])

  const filteredProjects = projects.filter(
    (project) => {
      const searchText = search
        .toLowerCase()
        .trim()

      const matchesSearch =
        project.title
          ?.toLowerCase()
          .includes(searchText) ||
        project.description
          ?.toLowerCase()
          .includes(searchText) ||
        project.tech
          ?.toLowerCase()
          .includes(searchText)

      const matchesTech =
        selectedTech === "All" ||
        project.tech
          ?.toLowerCase()
          .includes(
            selectedTech.toLowerCase()
          )

      return matchesSearch && matchesTech
    }
  )

  return (
    <main className="explore-page">

      {/* HEADER */}

      <section className="explore-header">

        <div>

          <p className="section-label">
            DISCOVER & EXPLORE
          </p>

          <h1>
            Find something
            <span> worth building.</span>
          </h1>

          <p>
            Explore projects created by developers
            and creators in the SkillSphere community.
          </p>

        </div>

        <div className="explore-count">
          <strong>
            {projects.length}
          </strong>

          <span>
            Projects
          </span>
        </div>

      </section>


      {/* SEARCH */}

      <section className="explore-controls">

        <div className="search-box">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Search projects, technologies..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
            >
              ×
            </button>
          )}

        </div>


        {/* FILTERS */}

        <div className="tech-filters">

          {technologies.map((tech) => (
            <button
              type="button"
              key={tech}
              className={
                selectedTech === tech
                  ? "tech-filter active"
                  : "tech-filter"
              }
              onClick={() =>
                setSelectedTech(tech)
              }
            >
              {tech}
            </button>
          ))}

        </div>

      </section>


      {/* RESULTS */}

      <section className="explore-results">

        <div className="results-heading">

          <h2>
            {search || selectedTech !== "All"
              ? "Search Results"
              : "All Projects"}
          </h2>

          <span>
            {filteredProjects.length} found
          </span>

        </div>


        {loading ? (
          <div className="explore-empty">
            <div className="loading-dot"></div>
            <p>Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="explore-empty">

            <div className="empty-icon">
              ◌
            </div>

            <h3>
              No projects found
            </h3>

            <p>
              Try another search or technology filter.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("")
                setSelectedTech("All")
              }}
            >
              Clear Filters
            </button>

          </div>
        ) : (
          <div className="explore-grid">

            {filteredProjects.map((project) => (

              <article
                className="explore-project-card"
                key={project._id}
              >

                {project.image ? (
                  <div className="explore-image-wrap">

                    <img
                      src={`http://localhost:5000${project.image}`}
                      alt={project.title}
                    />

                    <span className="project-badge">
                      PROJECT
                    </span>

                  </div>
                ) : (
                  <div className="explore-image-placeholder">
                    <span>◇</span>
                  </div>
                )}


                <div className="explore-card-body">

                  <h3>
                    {project.title}
                  </h3>

                  <p className="explore-description">
                    {project.description}
                  </p>


                  {project.tech && (
                    <div className="explore-tech">

                      {project.tech
                        .split(",")
                        .slice(0, 4)
                        .map((tech) => (
                          <span key={tech.trim()}>
                            {tech.trim()}
                          </span>
                        ))}

                    </div>
                  )}


                  <div className="explore-card-footer">

                    <div className="explore-stats">

                      <span>
                        ❤️ {project.likes || 0}
                      </span>

                      <span>
                        💬 {project.comments?.length || 0}
                      </span>

                    </div>

                    <Link
                      to={`/project/${project._id}`}
                    >
                      View Project →
                    </Link>

                  </div>

                </div>

              </article>

            ))}

          </div>
        )}

      </section>

    </main>
  )
}

export default Explore