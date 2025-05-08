"use client"

import { useState, useEffect } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { ArrowLeft, Save, Loader2, User, Mail, Phone, MapPin, AlertCircle, CheckCircle } from "lucide-react"
import RefreshToken from "../../../components/_common_/RefreshToken"

export default function UserForm() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const isEditMode = !!id

  // Get user data from location state if available (for edit mode)
  const userFromState = location.state?.user
  const roleFromState = location.state?.role

  const [formData, setFormData] = useState({
    email: "",
    nama: "",
    no_telp: "",
    alamat: "",
    image_profile: "",
  })

  const [role, setRole] = useState(roleFromState || "guru")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    // If we have user data from state, use it
    if (userFromState) {
      setFormData({
        email: userFromState.email || "",
        nama: userFromState.nama || "",
        no_telp: userFromState.no_telp || "",
        alamat: userFromState.alamat || "",
        image_profile: userFromState.image_profile || "",
      })
      return
    }

    // If in edit mode but no user data in state, fetch it
    if (isEditMode && id) {
      fetchUserData()
    }
  }, [isEditMode, id, userFromState])

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
        setFormData({
          email: data.Data.email || "",
          nama: data.Data.nama || "",
          no_telp: data.Data.no_telp || "",
          alamat: data.Data.alamat || "",
          image_profile: data.Data.image_profile || "",
        })
      } else {
        setError("User not found or error fetching data")
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      setError("Failed to fetch user data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleRoleChange = (e) => {
    setRole(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      let url, method

      if (isEditMode) {
        // Update existing user
        url = `${import.meta.env.VITE_API_URL}/actor/${role}`
        method = "PUT"
      } else {
        // Create new user
        url = `${import.meta.env.VITE_API_URL}/register/${role}`
        method = "POST"
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(isEditMode ? "User updated successfully!" : "User created successfully!")

        // Redirect after a short delay
        setTimeout(() => {
          navigate("/users")
        }, 1500)
      } else {
        setError(data.message || "An error occurred")
      }
    } catch (error) {
      console.error("Error saving user:", error)
      setError("Failed to save user. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/users")}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
          aria-label="Back to users"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? "Edit User" : "Create New User"}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isEditMode ? "Update user information" : "Add a new user to the system"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-100 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border-b border-green-100 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isEditMode}
                  className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isEditMode ? "bg-gray-50 text-gray-500" : ""
                  }`}
                  placeholder="user@example.com"
                />
              </div>
              {isEditMode && <p className="text-xs text-gray-500">Email cannot be changed</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                value={role}
                onChange={handleRoleChange}
                disabled={isEditMode}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isEditMode ? "bg-gray-50 text-gray-500" : ""
                }`}
              >
                <option value="guru">Guru</option>
                <option value="admin">Admin</option>
                <option value="kepalaSekolah">Kepala Sekolah</option>
              </select>
              {isEditMode && <p className="text-xs text-gray-500">Role cannot be changed</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="nama" className="block text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="nama"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Full name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="no_telp" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="no_telp"
                  name="no_telp"
                  value={formData.no_telp}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="+62 812 3456 7890"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label htmlFor="alamat" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="alamat"
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleChange}
                  rows="3"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Full address"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/users")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 mr-3 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 font-medium"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  {isEditMode ? "Update User" : "Create User"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
