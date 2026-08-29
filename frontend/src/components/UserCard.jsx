import { Link } from "react-router-dom"

function UserCard({ id, name, role, skill }) {
  return (
    <div className="user-card">
      <h3>{name}</h3>

      <p>{role}</p>

      <p>{skill}</p>

      {id && (
        <Link
          to={`/user/${id}`}
          className="edit-profile-btn"
        >
          View Profile
        </Link>
      )}
    </div>
  )
}

export default UserCard