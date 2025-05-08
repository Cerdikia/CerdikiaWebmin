"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Trash2, Mail, Phone, Calendar, Clock, User, Shield } from "lucide-react"
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
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => navigate("/users")}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md">
          <p className="text-yellow-700">User not found</p>
          <button
            onClick={() => navigate("/users")}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
          <p className="text-gray-500 text-sm mt-1">View and manage user information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User profile card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <img
                src={user.image_profile || "/img/default_user.png"}
                alt={user.nama}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
              />
              <div className="absolute bottom-0 right-0 bg-indigo-500 text-white p-1 rounded-full">
                <Edit size={16} />
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900">{user.nama || "No Name"}</h2>

            <div className="mt-1 flex items-center justify-center">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 capitalize">
                {role}
              </span>
            </div>

            <div className="w-full mt-6 pt-6 border-t border-gray-100">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-600 text-sm">{user.email}</span>
                </div>

                {user.no_telp && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-600 text-sm">{user.no_telp}</span>
                  </div>
                )}

                {user.created_at && (
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-600 text-sm">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full mt-6 flex space-x-3">
              <button
                onClick={() => navigate(`/users/edit/${user.email}`, { state: { user, role } })}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={handleDeleteClick}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* User details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center">
                <User className="w-5 h-5 text-indigo-500 mr-2" />
                <h3 className="font-medium text-gray-900">Personal Information</h3>
              </div>
              <button
                onClick={() => navigate(`/users/edit/${user.email}`, { state: { user, role } })}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Edit
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Full Name</h4>
                  <p className="text-gray-900">{user.nama || "-"}</p>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Email</h4>
                  <p className="text-gray-900">{user.email}</p>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Phone Number</h4>
                  <p className="text-gray-900">{user.no_telp || "-"}</p>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Role</h4>
                  <p className="text-gray-900 capitalize">{role}</p>
                </div>

                <div className="md:col-span-2">
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Address</h4>
                  <p className="text-gray-900">{user.alamat || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center">
              <Shield className="w-5 h-5 text-indigo-500 mr-2" />
              <h3 className="font-medium text-gray-900">Account Information</h3>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user.date_created && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Created At</h4>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{new Date(user.date_created).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}

                {user.updated_at && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Last Updated</h4>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{new Date(user.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}

                {/* Additional account information can be added here */}
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
