import {
  NavLink,
  useNavigate
} from "react-router-dom"

import {
  useEffect,
  useRef,
  useState
} from "react"

import { useAuth } from "../context/AuthContext"
import "./Navbar.css"


function Navbar() {

  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [search, setSearch] = useState("")
  const [users, setUsers] = useState([])
  const [searchLoading, setSearchLoading] =
    useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const searchRef = useRef(null)


  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    logout()
    navigate("/login")
  }


  // =========================
  // NAV LINK CLASS
  // =========================

  const getNavClass = ({ isActive }) =>
    isActive
      ? "nav-link active"
      : "nav-link"


  // =========================
  // USER SEARCH
  // =========================

  useEffect(() => {

    const searchUsers = async () => {

      if (!search.trim()) {
        setUsers([])
        return
      }

      try {

        setSearchLoading(true)

        const response =
          await fetch(
            `http://localhost:5000/api/auth/users?search=${encodeURIComponent(
              search.trim()
            )}`
          )

        const data =
          await response.json()

        if (response.ok) {
          setUsers(data)
        } else {
          setUsers([])
        }

      } catch (error) {

        console.error(
          "User search error:",
          error
        )

        setUsers([])

      } finally {

        setSearchLoading(false)

      }
    }


    const timer =
      setTimeout(
        searchUsers,
        300
      )

    return () => {
      clearTimeout(timer)
    }

  }, [search])


  // =========================
  // CLOSE SEARCH
  // =========================

  useEffect(() => {

    const handleClickOutside =
      (event) => {

        if (
          searchRef.current &&
          !searchRef.current.contains(
            event.target
          )
        ) {
          setSearch("")
          setUsers([])
        }

      }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    )

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      )
    }

  }, [])


  // =========================
  // OPEN USER PROFILE
  // =========================

  const handleUserClick =
    (userId) => {

      setSearch("")
      setUsers([])

      navigate(
        `/user/${userId}`
      )
    }


  return (

    <nav className="navbar">

      {/* =========================
          BRAND
      ========================= */}

      <NavLink
        to="/"
        className="logo"
      >

        <span className="logo-mark">
          B
        </span>

        <span className="logo-name">
          BuildOrbit
        </span>

      </NavLink>
      <button
  type="button"
  className="mobile-menu-btn"
  onClick={() =>
    setMobileMenuOpen((prev) => !prev)
  }
  aria-label="Open navigation menu"
>
  ⋮
</button>


      {/* =========================
          NAVIGATION
      ========================= */}

      <div
        className={
          mobileMenuOpen
            ? "nav-links mobile-open"
            : "nav-links"
        }
      >

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
            {user && (
  <button
    type="button"
    className="mobile-logout-btn"
    onClick={handleLogout}
  >
    Logout
  </button>
)}


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


      {/* =========================
          SEARCH
      ========================= */}

      <div
        className="navbar-search"
        ref={searchRef}
      >

        <div className="navbar-search-input">

          <span className="search-icon">
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search people..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

          {searchLoading && (
            <span className="search-loading">
              ...
            </span>
          )}

        </div>


        {search.trim() && (

          <div className="navbar-search-results">

            {searchLoading ? (

              <div className="navbar-search-empty">
                Searching...
              </div>

            ) : users.length === 0 ? (

              <div className="navbar-search-empty">
                No people found
              </div>

            ) : (

              <>

                <div className="navbar-search-title">
                  PEOPLE
                </div>


                {users.map((item) => (

                  <button
                    type="button"
                    key={item._id}
                    className="navbar-user-result"
                    onClick={() =>
                      handleUserClick(
                        item._id
                      )
                    }
                  >

                    <div className="navbar-user-avatar">
                      {item.name
                        ?.charAt(0)
                        ?.toUpperCase()}
                    </div>


                    <div className="navbar-user-info">

                      <strong>
                        {item.name}
                      </strong>

                      <span>
                        {item.role}
                      </span>

                    </div>

                  </button>

                ))}

              </>

            )}

          </div>

        )}

      </div>


      {/* =========================
          LOGOUT
      ========================= */}

      {user && (

        <button
          type="button"
          onClick={handleLogout}
          className="logout-btn"
        >
          Logout
        </button>

      )}

    </nav>

  )
}


export default Navbar