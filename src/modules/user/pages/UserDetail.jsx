"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import RefreshToken from "../../../components/_common_/RefreshToken"
import DeleteUserModal from "../components/DeleteUserModal"

export default function UserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [role, setRole] = useState("guru") // Default role
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [id, role])

  // Update the fetchUserData function to use the correct endpoint
  const fetchUserData = async () => {
    setLoading(true)
    setError(null)

    try {
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

      if (data.Message === "Success" && data.Data) {
        setUser(data.Data)
      } else {
        // If not found with current role, try other roles
        const roles = ["guru", "admin", "kepalaSekolah"].filter((r) => r !== role)

        for (const newRole of roles) {
          response = await fetch(`${import.meta.env.VITE_API_URL}/getDataActor/${newRole}/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          })

          const newData = await response.json()

          if (newData.Message === "Success" && newData.Data) {
            setUser(newData.Data)
            setRole(newRole)
            return
          }
        }

        setError("User not found")
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/actor`, {
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

              {/* Additional fields can be added here based on your user model */}
              {user.created_at && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                  <p className="mt-1 text-lg">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              )}

              {user.updated_at && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                  <p className="mt-1 text-lg">{new Date(user.updated_at).toLocaleDateString()}</p>
                </div>
              )}
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
