import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "./Navbar.css"

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const getNavClass = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link"

  return (
    <nav className="navbar">

     <NavLink to="/" className="logo">
        <span className="logo-mark">S</span>
        <span>SkillSphere</span>
      </NavLink>

      <div className="nav-links">

        <NavLink
          to="/"
          end
          className={getNavClass}
        >
          Home
        </NavLink>

        <NavLink
          to="/explore"
          className={getNavClass}
        >
          Explore
        </NavLink>

        {user ? (
          <>
            <NavLink
              to="/profile"
              className={getNavClass}
            >
              Profile
            </NavLink>

            <NavLink
              to="/my-projects"
              className={getNavClass}
            >
              My Projects
            </NavLink>

            <NavLink
              to="/create-project"
              className={getNavClass}
            >
              Create Project
            </NavLink>

            <button
              type="button"
              onClick={handleLogout}
              className="logout-btn"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              className={getNavClass}
            >
              Login
            </NavLink>

            <NavLink
              to="/signup"
              className={getNavClass}
            >
              Signup
            </NavLink>
          </>
        )}

      </div>
    </nav>
  )
}

export default Navbar