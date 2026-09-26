import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import "./ProjectDetails.css"

function ProjectDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  const [comment, setComment] = useState("")
  const [comments, setComments] = useState([])
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)

  // =========================
  // SAVED PROJECT STATE
  // =========================

  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  // =========================
// TEAM MEMBERS STATE
// =========================

const [teamMemberId, setTeamMemberId] = useState("")
const [addingTeamMember, setAddingTeamMember] = useState(false)
const [removingTeamMemberId, setRemovingTeamMemberId] = useState("")
const [activity, setActivity] = useState([])
const [teamMemberSearch, setTeamMemberSearch] = useState("")
const [teamMemberSearchResults, setTeamMemberSearchResults] = useState([])
const [teamMemberSearchLoading, setTeamMemberSearchLoading] = useState(false)

  // =========================
  // FETCH PROJECT
  // =========================

  useEffect(() => {
    const fetchProject = async () => {
      try {
       const response = await fetch(
  `http://localhost:5000/api/projects/${id}`
)

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message)
        }

        setProject(data)
        setLikes(data.likes || 0)
        setComments(data.comments || [])
        setActivity(data.activity || [])
        const token = localStorage.getItem("token")

        if (token && data.likedBy && user?.id) {
          setLiked(
            data.likedBy.some(
              (userId) =>
                userId.toString() ===
                user.id.toString()
            )
          )
        } else {
          setLiked(false)
        }
      } catch (error) {
        console.error(
          "Fetch project error:",
          error
        )
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id, user])
    // =========================
  // TEAM MEMBER USER SEARCH
  // =========================

  useEffect(() => {

    const searchUsers = async () => {

      if (!teamMemberSearch.trim()) {
        setTeamMemberSearchResults([])
        return
      }

      try {

        setTeamMemberSearchLoading(true)

        const response =
          await fetch(
            `http://localhost:5000/api/auth/users?search=${encodeURIComponent(
              teamMemberSearch.trim()
            )}`
          )

        const data =
          await response.json()

        if (!response.ok) {
          setTeamMemberSearchResults([])
          return
        }

        setTeamMemberSearchResults(
          data.filter(
            (item) =>
              item._id !== project?.owner?._id &&
              !project?.teamMembers?.some(
                (member) =>
                  member._id === item._id
              )
          )
        )

      } catch (error) {

        console.error(
          "Team member search error:",
          error
        )

        setTeamMemberSearchResults([])

      } finally {

        setTeamMemberSearchLoading(false)

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

  }, [
    teamMemberSearch,
    project
  ])


  // =========================
  // CHECK SAVED STATUS
  // =========================

  useEffect(() => {
    const checkSavedStatus = async () => {
      const token =
        localStorage.getItem("token")

      if (!token || !id) {
        setSaved(false)
        return
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/projects/saved/my-projects",
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        )

        if (!response.ok) {
          return
        }

        const data =
          await response.json()

        const savedProjects =
          data.savedProjects || []

        const isSaved =
          savedProjects.some(
            (savedProject) =>
              savedProject._id === id
          )

        setSaved(isSaved)
      } catch (error) {
        console.error(
          "Saved status error:",
          error
        )
      }
    }

    checkSavedStatus()
  }, [id, user])


  // =========================
  // LIKE / UNLIKE
  // =========================

  const handleLike = async () => {
    if (!user) {
      showToast(
        "Please login to like a project",
        "error"
      )
      return
    }

    const token =
      localStorage.getItem("token")

    if (!token) {
      showToast(
        "Please login again",
        "error"
      )
      return
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/projects/${id}/like`,
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      )

      const data =
        await response.json()

      if (!response.ok) {
        showToast(
          data.message,
          "error"
        )
        return
      }

      setLikes(data.likes)
      setLiked(data.liked)
    } catch (error) {
      console.error(
        "Like error:",
        error
      )

      showToast(
        "Unable to update like",
        "error"
      )
    }
  }


  // =========================
  // SAVE / UNSAVE
  // =========================

  const handleSave = async () => {
    if (!user) {
      showToast(
        "Please login to save a project",
        "error"
      )
      return
    }

    const token =
      localStorage.getItem("token")

    if (!token) {
      showToast(
        "Please login again",
        "error"
      )
      return
    }

    if (saving) {
      return
    }

    setSaving(true)

    try {
      const response = await fetch(
        `http://localhost:5000/api/projects/${id}/save`,
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      )

      const data =
        await response.json()

      if (!response.ok) {
        showToast(
          data.message ||
            "Unable to save project",
          "error"
        )
        return
      }

      setSaved(
        data.saved === true
      )

      showToast(
        data.saved
          ? "Project saved successfully"
          : "Project removed from saved projects",
        "success"
      )
    } catch (error) {
      console.error(
        "Save project error:",
        error
      )

      showToast(
        "Unable to update saved project",
        "error"
      )
    } finally {
      setSaving(false)
    }
  }


  // =========================
  // ADD COMMENT
  // =========================

  const handleAddComment = async () => {
    if (!user) {
      showToast(
        "Please login to comment",
        "error"
      )
      return
    }

    if (comment.trim() === "") {
      return
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/projects/${id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              `Bearer ${localStorage.getItem("token")}`
          },
        body: JSON.stringify({
          name: user.name,
          user: user.id,
          text: comment.trim()
        })
        }
      )

      const data =
        await response.json()

      if (!response.ok) {
        showToast(
          data.message,
          "error"
        )
        return
      }

      setComments(data.comments)
      setComment("")
    } catch (error) {
      console.error(
        "Comment error:",
        error
      )

      showToast(
        "Unable to add comment",
        "error"
      )
    }
  }
// =========================
// DELETE COMMENT
// =========================

const handleDeleteComment = async (commentId) => {
  if (!user) {
    showToast(
      "Please login again",
      "error"
    )
    return
  }

  const token =
    localStorage.getItem("token")

  if (!token) {
    showToast(
      "Please login again",
      "error"
    )
    return
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/projects/${id}/comments/${commentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    )

    const data =
      await response.json()

    if (!response.ok) {
      showToast(
        data.message ||
          "Unable to delete comment",
        "error"
      )
      return
    }

    setComments(
      data.comments || []
    )

    showToast(
      "Comment deleted successfully",
      "success"
    )
  } catch (error) {
    console.error(
      "Delete comment error:",
      error
    )

    showToast(
      "Unable to delete comment",
      "error"
    )
  }
}
  // =========================
// TEAM MEMBER MANAGEMENT
// =========================

const isProjectOwner =
  Boolean(
    user?.id &&
    project?.owner?._id &&
    user.id.toString() ===
      project.owner._id.toString()
  )


const handleAddTeamMember = async () => {

  if (!user) {
    showToast(
      "Please login to manage team members",
      "error"
    )
    return
  }

  if (!isProjectOwner) {
    showToast(
      "Only the project owner can add team members",
      "error"
    )
    return
  }

  const memberId =
    teamMemberId.trim()

  if (!memberId) {
    showToast(
      "Please enter a user ID",
      "error"
    )
    return
  }

  const token =
    localStorage.getItem("token")

  if (!token) {
    showToast(
      "Please login again",
      "error"
    )
    return
  }

  if (addingTeamMember) {
    return
  }

  setAddingTeamMember(true)

  try {

    const response =
      await fetch(
        `http://localhost:5000/api/projects/${id}/team-members`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({
            userId: memberId
          })
        }
      )

    const data =
      await response.json()

    if (!response.ok) {

      showToast(
        data.message ||
          "Unable to add team member",
        "error"
      )

      return
    }

    setProject(
      (currentProject) => ({
        ...currentProject,

        teamMembers:
          data.teamMembers || []
      })
    )
    setActivity((currentActivity) => [
      ...currentActivity,
      {
        type: "team_member_added",
        user: user.id,
        message: `${user.name} added ${teamMemberSearch} to the project`,
        createdAt: new Date().toISOString()
      }
    ])
    setTeamMemberId("")

    showToast(
      "Team member added successfully",
      "success"
    )

  } catch (error) {

    console.error(
      "Add team member error:",
      error
    )

    showToast(
      "Unable to add team member",
      "error"
    )

  } finally {

    setAddingTeamMember(false)

  }
}


const handleRemoveTeamMember = async (
  memberId,
  memberName
) => {

  if (!user) {
    showToast(
      "Please login to manage team members",
      "error"
    )
    return
  }

  if (!isProjectOwner) {
    showToast(
      "Only the project owner can remove team members",
      "error"
    )
    return
  }

  const token =
    localStorage.getItem("token")

  if (!token) {
    showToast(
      "Please login again",
      "error"
    )
    return
  }

  if (removingTeamMemberId) {
    return
  }

  setRemovingTeamMemberId(
    memberId
  )

  try {

    const response =
      await fetch(
        `http://localhost:5000/api/projects/${id}/team-members/${memberId}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      )

    const data =
      await response.json()

    if (!response.ok) {

      showToast(
        data.message ||
          "Unable to remove team member",
        "error"
      )

      return
    }

    setProject(
      (currentProject) => ({
        ...currentProject,

        teamMembers:
          data.teamMembers || []
      })
    )
    setActivity((currentActivity) => [
      ...currentActivity,
      {
        type: "team_member_removed",
        user: user.id,
        message: `${user.name} removed ${memberName} from the project`,
        createdAt: new Date().toISOString()
      }
    ])
    
    showToast(
      "Team member removed successfully",
      "success"
    )

  } catch (error) {

    console.error(
      "Remove team member error:",
      error
    )

    showToast(
      "Unable to remove team member",
      "error"
    )

  } finally {

    setRemovingTeamMemberId("")
  }
}


  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="project-details-page">

        <section className="project-details-state">

          <div className="details-loader"></div>

          <h2>
            Loading project...
          </h2>

          <p>
            Getting the project details for you.
          </p>

        </section>

      </main>
    )
  }


  // =========================
  // PROJECT NOT FOUND
  // =========================

  if (!project) {
    return (
      <main className="project-details-page">

        <section className="project-details-state">

          <div className="details-empty-icon">
            ◇
          </div>

          <h2>
            Project not found
          </h2>

          <p>
            This project may have been deleted
            or is no longer available.
          </p>

          <Link to="/explore">
            ← Back to Explore
          </Link>

        </section>

      </main>
    )
  }


  // =========================
  // TECH STACK
  // =========================

  const techStack = project.tech
    ? project.tech
        .split(",")
        .map((tech) => tech.trim())
        .filter(Boolean)
    : []


  // =========================
  // IMAGE URL
  // =========================

  const imageUrl =
    project.image?.startsWith("http")
      ? project.image  
      : `http://localhost:5000${project.image}`


  return (
    <main className="project-details-page">

      <div className="project-details-container">


        {/* =========================
            BACK
        ========================= */}

        <Link
          to="/explore"
          className="back-to-explore"
        >
          ← Back to Explore
        </Link>


        {/* =========================
            HERO
        ========================= */}

        <section className="project-showcase">

          <div className="project-showcase-content">

            <div className="project-showcase-copy">

              <p className="section-label">
                PROJECT SHOWCASE
              </p>

              <h1>
                {project.title}
              </h1>

              <p className="project-details-description">
                {project.description}
              </p>


              {techStack.length > 0 && (

                <div className="details-tech-stack">

                  {techStack.map((tech) => (
                    <span key={tech}>
                      {tech}
                    </span>
                  ))}

                </div>

              )}

            </div>


            <div className="project-showcase-mark">
              <span>✦</span>
            </div>

          </div>

        </section>


        {/* =========================
            IMAGE
        ========================= */}

        {project.image && (

          <section className="project-hero-image">

            <img
              src={imageUrl}
              alt={project.title}
            />

          </section>

        )}


        {/* =========================
            INFO BAR
        ========================= */}

        <section className="project-info-bar">


          {/* STATS */}

          <div className="project-stats">


            {/* LIKE */}

            <button
              type="button"
              onClick={handleLike}
              className={
                liked
                  ? "like-button liked"
                  : "like-button"
              }
            >

              <span>
                {liked ? "♥" : "♡"}
              </span>

              {likes}

              <small>
                {liked
                  ? "Liked"
                  : "Likes"}
              </small>

            </button>


            {/* COMMENTS */}

            <div className="comment-stat">

              <span>
                💬
              </span>

              <strong>
                {comments.length}
              </strong>

              <small>
                Comments
              </small>

            </div>


            {/* SAVE */}

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={
                saved
                  ? "save-project-button saved"
                  : "save-project-button"
              }
            >

              <span>
                {saving
                  ? "..."
                  : saved
                    ? "🔖"
                    : "🔖"}
              </span>

              <small>
                {saving
                  ? "Saving..."
                  : saved
                    ? "Saved"
                    : "Save"}
              </small>

            </button>

          </div>


          {/* PROJECT LINKS */}

          <div className="project-actions">

            {project.github && (

              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="project-external-link"
              >
                GitHub ↗
              </a>

            )}


            {project.liveDemo && (

              <a
                href={project.liveDemo}
                target="_blank"
                rel="noreferrer"
                className="project-external-link primary-link"
              >
                Live Demo ↗
              </a>

            )}

          </div>

        </section>


        {/* =========================
            MAIN CONTENT
        ========================= */}

        <div className="project-content-grid">


          <div className="project-content-main">


            {/* =========================
                ABOUT
            ========================= */}

            <section className="project-about-section">

              <p className="section-label">
                ABOUT THE PROJECT
              </p>

              <h2>
                What was built?
              </h2>

              <p>
                {project.description}
              </p>

            </section>
   
            {/* =========================
    PROJECT ACTIVITY
========================= */}

{activity.length > 0 && (
  <section className="project-activity-section">

    <div className="project-activity-heading">

      <div>
        <p className="section-label">
          COLLABORATION
        </p>

        <h2>
          Project Activity
        </h2>
      </div>

      <span>
        {activity.length}
      </span>

    </div>

    <div className="project-activity-list">

      {activity
        .slice()
        .reverse()
        .map((item, index) => (

          <div
            className="project-activity-item"
            key={
              item._id || index
            }
          >

            <div className="project-activity-dot">
              ●
            </div>

            <div className="project-activity-content">

              <p>
                {item.message}
              </p>

              {item.createdAt && (
                <span>
                  {new Date(
                    item.createdAt
                  ).toLocaleString()}
                </span>
              )}

            </div>

          </div>

        ))}

    </div>

  </section>
)}


            {/* =========================
                COMMENTS
            ========================= */}

            <section className="project-comments">

              <div className="comments-heading">

                <div>

                  <p className="section-label">
                    COMMUNITY
                  </p>

                  <h2>
                    Comments
                  </h2>

                </div>

                <span>
                  {comments.length}
                </span>

              </div>


              {/* COMMENT FORM */}

              {user ? (

                <div className="comment-form">

                  <div className="comment-input-avatar">

                    {user.name
                      ?.charAt(0)
                      .toUpperCase()}

                  </div>


                  <input
                    type="text"
                    placeholder="Share your thoughts about this project..."
                    value={comment}
                    onChange={(e) =>
                      setComment(
                        e.target.value
                      )
                    }
                    onKeyDown={(e) => {

                      if (e.key === "Enter") {
                        handleAddComment()
                      }

                    }}
                  />


                  <button
                    type="button"
                    onClick={handleAddComment}
                  >
                    Comment
                  </button>

                </div>

              ) : (

                <div className="login-comment-message">

                  <p>
                    Login to join the
                    conversation.
                  </p>

                  <Link to="/login">
                    Login →
                  </Link>

                </div>

              )}


              {/* COMMENTS LIST */}

              <div className="comments-list">

                {comments.length === 0 ? (

                  <div className="no-comments">

                    <span>
                      💬
                    </span>

                    <h3>
                      No comments yet
                    </h3>

                    <p>
                      Be the first person to
                      share your thoughts.
                    </p>

                  </div>

                ) : (

                  comments.map(
                    (item, index) => (

                      <article
                        className="comment-item"
                        key={
                          item._id || index
                        }
                      >

                        <div className="comment-avatar">

                          {item.name
                            ?.charAt(0)
                            .toUpperCase()}

                        </div>


                        <div className="comment-content">

                          <div className="comment-author">

                            <strong>
                              {item.name}
                            </strong>


                            {item.createdAt && (

                              <span>

                                {new Date(
                                  item.createdAt
                                ).toLocaleDateString()}

                              </span>

                            )}

                          </div>


                          <p>
                            {item.text}
                          </p>
                         {item.user &&
                          user?.id &&
                          item.user.toString() ===
                            user.id.toString() && (
                            <button
                              type="button"
                              className="delete-comment-button"
                              onClick={() =>
                                handleDeleteComment(
                                  item._id
                                )
                              }
                            >
                              Delete
                            </button>
                          )}

                        </div>

                      </article>

                    )
                  )

                )}

              </div>

            </section>

          </div>


          {/* =========================
              SIDEBAR
          ========================= */}

          <aside className="project-details-sidebar">


            {/* CREATOR */}

            {project.owner && (

              <section className="creator-showcase">

                <p className="section-label">
                  CREATED BY
                </p>


                <div className="creator-profile">

                  <div className="creator-avatar">

                    {project.owner.name
                      ?.charAt(0)
                      .toUpperCase()}

                  </div>


                  <div className="creator-info">

                    <h3>
                      {project.owner.name}
                    </h3>

                    <p>
                      {project.owner.role ===
                      "developer"
                        ? "Developer"
                        : "Creator"}
                    </p>

                  </div>

                </div>

              </section>

            )}

{/* =========================
    TEAM MEMBERS
========================= */}

<section className="details-sidebar-card team-members-section">

  <p className="section-label">
    COLLABORATION
  </p>

  <div className="team-members-header">

    <h3 className="team-members-title">
      Team Members
    </h3>

    <span className="team-members-count">
      {project.teamMembers?.length || 0}
    </span>

  </div>


  {/* PROJECT OWNER */}

  {project.owner && (
    <div className="team-member-owner">

      <div className="team-member-avatar">

        {project.owner.name
          ?.charAt(0)
          .toUpperCase()}

      </div>

      <div className="team-member-info">

        <strong>
          {project.owner.name}
        </strong>

        <span>
          Project Owner
        </span>

      </div>

    </div>
  )}


  {/* TEAM MEMBERS */}

  {project.teamMembers?.length > 0 ? (

    project.teamMembers.map(
      (member) => (

        <div
          key={member._id}
          className="team-member-item"
        >

          <div className="team-member-avatar">

            {member.name
              ?.charAt(0)
              .toUpperCase()}

          </div>


          <div className="team-member-info">

            <strong>
              {member.name}
            </strong>

            <span>
              {member.role === "developer"
                ? "Developer"
                : "Creator"}
            </span>

          </div>


          {/* REMOVE BUTTON */}

          {isProjectOwner && (

            <button
              type="button"
              className="team-member-remove"
              onClick={() =>
              handleRemoveTeamMember(
                member._id,
                member.name
              )
            }
              disabled={
                removingTeamMemberId ===
                member._id
              }
            >
              {removingTeamMemberId ===
              member._id
                ? "..."
                : "Remove"}
            </button>

          )}

        </div>

      )

    )

  ) : (

    <p className="team-members-empty">
      No additional team members yet.
    </p>

  )}


  {/* ADD MEMBER */}

{isProjectOwner && (
  <div className="team-member-add">
    <label className="team-member-add-label">
      ADD TEAM MEMBER
    </label>

    <div className="team-member-add-row">
      <input
        type="text"
        className="team-member-add-input"
        value={teamMemberSearch}
        onChange={(e) => {
          setTeamMemberSearch(e.target.value)
        }}
        placeholder="Search by name or email..."
        disabled={addingTeamMember}
      />
    </div>

    {teamMemberSearchLoading && (
      <div className="team-member-search-status">
        Searching...
      </div>
    )}

    {!teamMemberSearchLoading &&
      teamMemberSearch.trim() &&
      teamMemberSearchResults.length === 0 && (
        <div className="team-member-search-status">
          No users found
        </div>
      )}

    {teamMemberSearchResults.length > 0 && (
      <div className="team-member-search-results">
        {teamMemberSearchResults.map((item) => (
          <button
            key={item._id}
            type="button"
            className="team-member-search-result"
            onClick={() => {
              setTeamMemberId(item._id)
              setTeamMemberSearch(item.name)
              setTeamMemberSearchResults([])
            }}
            disabled={addingTeamMember}
          >
            <div className="team-member-search-avatar">
              {item.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="team-member-search-info">
              <div className="team-member-search-name">
                {item.name}
              </div>

              <div className="team-member-search-email">
                {item.email}
              </div>
            </div>

            <span className="team-member-search-select">
              Select
            </span>
          </button>
        ))}
      </div>
    )}

    {teamMemberId && (
      <div className="team-member-selected">
        <div className="team-member-selected-info">
          <span className="team-member-selected-label">
            Selected member
          </span>

          <strong>{teamMemberSearch}</strong>
        </div>

        <button
          type="button"
          className="team-member-selected-button"
          onClick={handleAddTeamMember}
          disabled={addingTeamMember}
        >
          {addingTeamMember
            ? "Adding..."
            : "＋ Add Member"}
        </button>
      </div>
    )}
  </div>
)}
</section>


            {/* TECH */}

            {techStack.length > 0 && (

              <section className="details-sidebar-card">

                <p className="section-label">
                  BUILT WITH
                </p>

                <div className="sidebar-tech-list">

                  {techStack.map((tech) => (
                    <span key={tech}>
                      {tech}
                    </span>
                  ))}

                </div>

              </section>

            )}


            {/* PROJECT LINKS */}

            {(project.github ||
              project.liveDemo) && (

              <section className="details-sidebar-card">

                <p className="section-label">
                  EXPLORE
                </p>

                <div className="sidebar-links">

                  {project.github && (

                    <a
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                    >

                      <span>
                        GitHub
                      </span>

                      <b>
                        ↗
                      </b>

                    </a>

                  )}


                  {project.liveDemo && (

                    <a
                      href={project.liveDemo}
                      target="_blank"
                      rel="noreferrer"
                    >

                      <span>
                        Live Demo
                      </span>

                      <b>
                        ↗
                      </b>

                    </a>

                  )}

                </div>

              </section>

            )}

          </aside>

        </div>

      </div>

    </main>
  )
}

export default ProjectDetails