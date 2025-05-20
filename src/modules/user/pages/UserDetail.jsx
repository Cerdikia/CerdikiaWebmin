"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import RefreshToken from "../../../components/_common_/RefreshToken"
import DeleteUserModal from "../components/DeleteUserModal"

export default function UserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  // Get role from location state or default to "guru"
  const initialRole = location.state?.role || "guru"
  const userDataFromState = location.state?.userData || null

  const [user, setUser] = useState(null)
  const [role, setRole] = useState(initialRole)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [id, role])

  // Update the fetchUserData function to handle array responses
  const fetchUserData = async () => {
    setLoading(true)
    setError(null)

    try {
      // First, try to get the user with the current role
      let response = await fetch(`${import.meta.env.VITE_API_URL}/getDataActor/${role}/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      if (response.status === 401) {
        const refreshed = await RefreshToken()
        if (refreshed) {
          response = await fetch(`${import.meta.env.VITE_API_URL}/getDataActor/${role}/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          })
        } else {
          navigate("/login", { replace: true })
          return
        }
      }

      const data = await response.json()
      console.log("API Response:", data) // Debug log

      // Check if data exists and handle both array and object responses
      if (data.Message === "Success" || data.Message === "Data retrieved successfully") {
        // Handle case where Data is an array
        if (Array.isArray(data.Data) && data.Data.length > 0) {
          const userData = data.Data[0]
          // If image_profile is missing or null, use the one from state
          if ((!userData.image_profile || userData.image_profile === "") && userDataFromState?.image_profile) {
            userData.image_profile = userDataFromState.image_profile
          }
          setUser(userData)
          return
        }
        // Handle case where Data is an object
        else if (data.Data && typeof data.Data === "object" && data.Data.email) {
          const userData = data.Data
          // If image_profile is missing or null, use the one from state
          if ((!userData.image_profile || userData.image_profile === "") && userDataFromState?.image_profile) {
            userData.image_profile = userDataFromState.image_profile
          }
          setUser(userData)
          return
        }
      }

      // If we get here, we didn't find a user with the current role
      // Try other roles if we started with the role from state
      if (role === initialRole) {
        const roles = ["guru", "admin", "kepalaSekolah"].filter((r) => r !== role)
        let userFound = false

        for (const newRole of roles) {
          try {
            console.log(`Trying role: ${newRole}`) // Debug log
            const altResponse = await fetch(`${import.meta.env.VITE_API_URL}/getDataActor/${newRole}/${id}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              },
            })

            if (altResponse.ok) {
              const altData = await altResponse.json()
              console.log(`Response for role ${newRole}:`, altData) // Debug log

              if (altData.Message === "Success" || altData.Message === "Data retrieved successfully") {
                // Handle array response
                if (Array.isArray(altData.Data) && altData.Data.length > 0) {
                  const userData = altData.Data[0]
                  // If image_profile is missing or null, use the one from state
                  if ((!userData.image_profile || userData.image_profile === "") && userDataFromState?.image_profile) {
                    userData.image_profile = userDataFromState.image_profile
                  }
                  setUser(userData)
                  setRole(newRole)
                  userFound = true
                  break
                }
                // Handle object response
                else if (altData.Data && typeof altData.Data === "object" && altData.Data.email) {
                  const userData = altData.Data
                  // If image_profile is missing or null, use the one from state
                  if ((!userData.image_profile || userData.image_profile === "") && userDataFromState?.image_profile) {
                    userData.image_profile = userDataFromState.image_profile
                  }
                  setUser(userData)
                  setRole(newRole)
                  userFound = true
                  break
                }
              }
            }
          } catch (err) {
            console.error(`Error trying role ${newRole}:`, err)
          }
        }

        if (!userFound) {
          setError("User not found. Please check the email address and try again.")
        }
      } else {
        setError("User not found with the specified role.")
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      setError("Failed to fetch user data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/deleteDataUser`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          email: user.email,
          role: role,
        }),
      })

      if (response.ok) {
        navigate("/users", { replace: true })
      } else {
        const errorData = await response.json()
        setError(`Failed to delete user: ${errorData.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      setError("Failed to delete user. Please try again.")
    } finally {
      setIsDeleteModalOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => navigate("/users")}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Users
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <p className="text-yellow-700">User not found</p>
          <button
            onClick={() => navigate("/users")}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Users
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate("/users")} className="mr-4 p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">User Details</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3 bg-gray-50 p-6 flex flex-col items-center">
            <img
              src={user.image_profile || "/img/default_user.png"}
              alt={user.nama}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
            />
            <h2 className="mt-4 text-xl font-bold text-gray-900">{user.nama}</h2>
            <p className="text-indigo-600 font-medium capitalize">{role}</p>

            <div className="mt-6 flex space-x-2">
              <button
                onClick={() => navigate(`/users/edit/${user.email}`, { state: { user, role } })}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={handleDeleteClick}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>

          <div className="md:w-2/3 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-lg">{user.email}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Role</h3>
                <p className="mt-1 text-lg capitalize">{role}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="mt-1 text-lg">{user.nama || "Not specified"}</p>
              </div>

              {user.jabatan && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Position</h3>
                  <p className="mt-1 text-lg">{user.jabatan}</p>
                </div>
              )}

              {user.date_created && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                  <p className="mt-1 text-lg">{new Date(user.date_created).toLocaleDateString()}</p>
                </div>
              )}

              {user.updated_at && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                  <p className="mt-1 text-lg">{new Date(user.updated_at).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            {/* Activity section */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-500 text-center py-4">No recent activity found</p>
                {/* Activity items would go here */}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        user={user}
      />
    </div>
  )
}
