import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import Button from "../components/Button"
import "./Auth.css"

function Signup() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState("")

  const { login } = useAuth()
  const { showToast } = useToast()

  const handleSignup = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      showToast(
        "Passwords do not match",
        "error"
      )
      return
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name,
            email,
            password,
            role
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        showToast(data.message, "error")
        return
      }

      login(data.user)

      showToast(
        "Account created successfully!",
        "success"
      )
    } catch (error) {
      console.error(
        "Signup error:",
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
            JOIN THE COMMUNITY
          </p>

          <h1>
            Build.
            <br />
            Share.
            <br />
            <span>Get noticed.</span>
          </h1>

          <p className="auth-intro-text">
            Create your profile, showcase
            your work and connect with
            people building cool things.
          </p>

          <div className="auth-decoration">
            <span>✦</span>
            <span>◇</span>
            <span>+</span>
          </div>

        </section>


        {/* SIGNUP CARD */}

        <section className="auth-card signup-card">

          <div className="auth-card-header">

            <p className="section-label">
              GET STARTED
            </p>

            <h2>
              Create your account
            </h2>

            <p className="auth-subtitle">
              Build your profile and start
              connecting with creators.
            </p>

          </div>


          <form onSubmit={handleSignup}>

            {/* NAME */}

            <div className="auth-field">

              <label>
                Name
              </label>

              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                autoComplete="name"
                required
              />

            </div>


            {/* EMAIL */}

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


            {/* PASSWORD */}

            <div className="auth-field">

              <label>
                Password
              </label>

              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="new-password"
                required
              />

            </div>


            {/* CONFIRM PASSWORD */}

            <div className="auth-field">

              <label>
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                autoComplete="new-password"
                required
              />

            </div>


            {/* ROLE */}

            <div className="auth-field">

              <label>
                I am a
              </label>

              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
                required
              >
                <option value="">
                  Select your role
                </option>

                <option value="developer">
                  Developer
                </option>

                <option value="creator">
                  Creator
                </option>
              </select>

            </div>


            <Button type="submit">
              Create Account →
            </Button>

          </form>


          <div className="auth-footer">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Login
            </Link>

          </div>

        </section>

      </div>

    </main>
  )
}

export default Signup