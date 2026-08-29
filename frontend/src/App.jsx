import { BrowserRouter, Routes, Route } from "react-router-dom"

import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import ProtectedRoute from "./components/ProtectedRoute"

import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Explore from "./pages/Explore"
import Profile from "./pages/Profile"
import EditProfile from "./pages/EditProfile"
import CreateProject from "./pages/CreateProject"
import MyProjects from "./pages/MyProjects"
import EditProject from "./pages/EditProject"
import ProjectDetails from "./pages/ProjectDetails"
import NotFound from "./pages/NotFound"
import StateExample from "./pages/StateExample"

import { AuthProvider } from "./context/AuthContext"

import "./App.css"
import UserProfile from "./pages/UserProfile"
import Toast from "./components/Toast"
import { ToastProvider } from "./context/ToastContext"

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
       <BrowserRouter>
        <Navbar />

        <Routes>

          {/* PUBLIC ROUTES */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          <Route
            path="/explore"
            element={<Explore />}
          />

          <Route
            path="/project/:id"
            element={<ProjectDetails />}
          />

          <Route
            path="/state-test"
            element={<StateExample />}
          />


          {/* PROTECTED ROUTES */}
           
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-project"
            element={
              <ProtectedRoute>
                <CreateProject />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-projects"
            element={
              <ProtectedRoute>
                <MyProjects />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-project/:id"
            element={
              <ProtectedRoute>
                <EditProject />
              </ProtectedRoute>
            }
          />


          {/* 404 */}

          <Route
            path="*"
            element={<NotFound />}
          />
          <Route
            path="/user/:id"
            element={<UserProfile />}
          />

        </Routes>

        <Footer />

      </BrowserRouter>
    </ToastProvider>
  </AuthProvider>
  )
}

export default App