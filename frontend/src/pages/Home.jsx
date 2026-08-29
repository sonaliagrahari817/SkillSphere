import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import ProjectCard from "../components/ProjectCard"
import UserCard from "../components/UserCard"
import "./Home.css"

function Home() {
  const [projects, setProjects] = useState([])
  const [creators, setCreators] = useState([])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/projects"
        )

        const data = await response.json()

        if (response.ok) {
          setProjects(data.slice(0, 3))
        }
      } catch (error) {
        console.error("Projects fetch error:", error)
      }
    }

    fetchProjects()
  }, [])

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/users"
        )

        const data = await response.json()

        if (response.ok) {
          setCreators(data.slice(0, 3))
        }
      } catch (error) {
        console.error("Creators fetch error:", error)
      }
    }

    fetchCreators()
  }, [])

  return (
    <main className="home-page">

      {/* HERO */}

      <section className="hero">

        <div className="hero-glow"></div>

        <div className="hero-content">

          <p className="hero-badge">
            DEVELOPER • CREATOR • COMMUNITY
          </p>

          <h1>
            Build something
            <span> worth sharing.</span>
          </h1>

          <p className="hero-text">
            SkillSphere is a community for developers
            and creators to showcase projects, discover
            talent, and connect through what they build.
          </p>

          <div className="hero-actions">

            <Link
              to="/explore"
              className="primary-btn"
            >
              Explore Projects →
            </Link>

            <Link
              to="/signup"
              className="secondary-btn"
            >
              Join SkillSphere
            </Link>

          </div>

          <div className="hero-stats">

            <div>
              <strong>100+</strong>
              <span>Projects</span>
            </div>

            <div>
              <strong>50+</strong>
              <span>Creators</span>
            </div>

            <div>
              <strong>15+</strong>
              <span>Skills</span>
            </div>

          </div>

        </div>

      </section>


      {/* WHY SKILLSPHERE */}

      <section className="about-section">

        <p className="section-label">
          WHY SKILLSPHERE?
        </p>

        <h2>
          Your skills are better
          <span> when they're visible.</span>
        </h2>

        <p className="about-text">
          Don't just list what you know. Show what
          you can build, discover what others are
          creating, and connect with people who share
          your interests.
        </p>

        <div className="value-grid">

          <div className="value-card">
            <div className="value-icon">✦</div>

            <h3>Showcase</h3>

            <p>
              Turn your projects into a portfolio
              that actually tells your story.
            </p>
          </div>

          <div className="value-card">
            <div className="value-icon">⌕</div>

            <h3>Discover</h3>

            <p>
              Explore projects, technologies and
              creators from the community.
            </p>
          </div>

          <div className="value-card">
            <div className="value-icon">↗</div>

            <h3>Connect</h3>

            <p>
              Find people with complementary skills
              and start building together.
            </p>
          </div>

        </div>

      </section>


      {/* FEATURED PROJECTS */}

      <section className="section home-projects">

        <div className="section-heading">

          <div>
            <p className="section-label">
              FROM THE COMMUNITY
            </p>

            <h2>Featured Projects</h2>

            <p>
              See what creators are building.
            </p>
          </div>

          <Link
            to="/explore"
            className="section-link"
          >
            View all →
          </Link>

        </div>

        {projects.length > 0 ? (
          <div className="project-grid">

            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                id={project._id}
                title={project.title}
                description={project.description}
                tech={project.tech}
                image={project.image}
              />
            ))}

          </div>
        ) : (
          <div className="empty-home-state">
            <p>No projects yet.</p>

            <Link to="/explore">
              Explore the community
            </Link>
          </div>
        )}

      </section>


      {/* CREATORS */}

      <section className="section creators-section">

        <div className="section-heading">

          <div>
            <p className="section-label">
              MEET THE COMMUNITY
            </p>

            <h2>Top Creators</h2>

            <p>
              People turning ideas into real projects.
            </p>
          </div>

        </div>

        {creators.length > 0 ? (
          <div className="creator-grid">

            {creators.map((creator) => (
              <UserCard
                key={creator._id}
                id={creator._id}
                name={creator.name}
                role={
                  creator.role === "developer"
                    ? "Developer"
                    : "Creator"
                }
                skill={
                  creator.skills
                    ? creator.skills
                        .split(",")[0]
                        .trim()
                    : "Creator"
                }
              />
            ))}

          </div>
        ) : (
          <p className="empty-home-state">
            No creators yet.
          </p>
        )}

      </section>


      {/* FINAL CTA */}

      <section className="home-cta">

        <p className="section-label">
          READY TO BUILD?
        </p>

        <h2>
          Your next project
          <span> starts here.</span>
        </h2>

        <p>
          Create your profile, showcase your work
          and become part of SkillSphere.
        </p>

        <Link
          to="/signup"
          className="primary-btn"
        >
          Create Your Profile →
        </Link>

      </section>

    </main>
  )
}

export default Home