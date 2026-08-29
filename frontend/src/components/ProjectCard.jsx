import { Link } from "react-router-dom"

function ProjectCard({
  id,
  title,
  description,
  tech,
  image
}) {
  return (
    <div className="project-card">

      {image && (
        <img
          src={`https://skillsphere-backend-puyd.onrender.com${image}`}
          alt={title}
          className="project-card-image"
        />
      )}

      <h3>{title}</h3>

      <p>{description}</p>

      <p>{tech}</p>

      <Link
        to={`/project/${id}`}
        className="project-view-btn"
      >
        View Project
      </Link>

    </div>
  )
}

export default ProjectCard