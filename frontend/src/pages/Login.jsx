import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import Button from "../components/Button"
import "./Auth.css"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const { login } = useAuth()
  const { showToast } = useToast()

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch(
        "https://skillsphere-backend-puyd.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        showToast(data.message, "error")
        return
      }

      login(data.user, data.token)

      showToast(
        "Login successful!",
        "success"
      )
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      )

      showToast(
        "Unable to connect to server",
        "error"
      )
    }
  }

  return (
    <main className="auth-page">

      <div className="auth-layout">

        {/* LEFT SIDE */}

        <section className="auth-intro">

          <Link
            to="/"
            className="auth-brand"
          >
            Skill<span>Sphere</span>
          </Link>

          <p className="section-label">
            WELCOME BACK
          </p>

          <h1>
            Your work.
            <br />
            Your space.
            <br />
            <span>Your community.</span>
          </h1>

          <p className="auth-intro-text">
            Pick up where you left off and
            keep building something worth
            sharing.
          </p>

          <div className="auth-decoration">
            <span>✦</span>
            <span>◇</span>
            <span>+</span>
          </div>

        </section>


        {/* LOGIN CARD */}

        <section className="auth-card">

          <div className="auth-card-header">

            <p className="section-label">
              SIGN IN
            </p>

            <h2>
              Welcome back
            </h2>

            <p className="auth-subtitle">
              Continue building, connecting
              and creating.
            </p>

          </div>


          <form onSubmit={handleLogin}>

            <div className="auth-field">

              <label>
                Email
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                autoComplete="email"
                required
              />

            </div>


            <div className="auth-field">

              <div className="auth-label-row">

                <label>
                  Password
                </label>

              </div>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="current-password"
                required
              />

            </div>


            <Button type="submit">
              Login →
            </Button>

          </form>


          <div className="auth-footer">

            <span>
              Don't have an account?
            </span>

            <Link to="/signup">
              Create one
            </Link>

          </div>

        </section>

      </div>

    </main>
  )
}

export default Login