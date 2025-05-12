"use client"

import { useState, useEffect } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
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
    jabatan: "", // Added jabatan field
  })

  const [role, setRole] = useState(roleFromState || "guru")
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if current user is admin - directly from localStorage
    const currentUserRole = localStorage.getItem("user_data") ? JSON.parse(localStorage.getItem("user_data")).role : null
    setIsAdmin(currentUserRole === "admin")

    // If we have user data from state, use it
    if (userFromState) {
      setFormData({
        email: userFromState.email || "",
        nama: userFromState.nama || "",
        jabatan: userFromState.jabatan || "", // Set jabatan from user data
      })

      // Set image preview if there's an existing image_profile
      if (userFromState.image_profile) {
        setImagePreview(userFromState.image_profile)
      }

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
      let response = await fetch(`${import.meta.env.VITE_API_URL}/actor/${role}/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      if (response.status === 401) {
        const refreshed = await RefreshToken()
        if (refreshed) {
          response = await fetch(`${import.meta.env.VITE_API_URL}/actor/${role}/${id}`, {
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
          jabatan: data.Data.jabatan || "", // Set jabatan from API response
        })

        // Set image preview if there's an existing image_profile
        if (data.Data.image_profile) {
          setImagePreview(data.Data.image_profile)
        }
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

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Function to upload image
  const uploadImage = async (email) => {
    if (!imageFile) return true // Skip if no image to upload

    try {
      const formDataImage = new FormData()
      formDataImage.append("image", imageFile)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/patchImageProfile/${role}/${email}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: formDataImage,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      return true
    } catch (error) {
      console.error("Error uploading image:", error)
      setError("User data saved, but failed to upload image. Please try again.")
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Check if we're in edit mode and the role has changed
      if (isEditMode && role !== roleFromState) {
        // Call the changeUserRole endpoint
        const roleChangeResponse = await fetch(`${import.meta.env.VITE_API_URL}/changeUserRole`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({
            email: formData.email,
            old_role: roleFromState,
            new_role: role,
          }),
        })

        const roleChangeData = await roleChangeResponse.json()

        if (!roleChangeResponse.ok) {
          throw new Error(roleChangeData.message || "Failed to change user role")
        }

        setSuccess("User role changed successfully!")

        // If only the role changed (name is the same), don't call editDataUser
        const hasNameChanged = userFromState && userFromState.nama !== formData.nama
        const hasJabatanChanged = userFromState && userFromState.jabatan !== formData.jabatan

        if (!hasNameChanged && !hasJabatanChanged) {
          // If only the role changed, we're done - redirect after a short delay
          setTimeout(() => {
            navigate("/users")
          }, 1500)
          return
        }
      }

      // If we're here, either it's not edit mode, or the role didn't change, or name/jabatan changed too
      if (isEditMode) {
        // Update existing user data (only if needed)
        const response = await fetch(`${import.meta.env.VITE_API_URL}/editDataUser/${roleFromState}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(formData),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Failed to save user data")
        }
      } else {
        // Create new user
        const response = await fetch(`${import.meta.env.VITE_API_URL}/register/${role}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(formData),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Failed to save user data")
        }
      }

      // If user data was saved successfully and we have an image to upload, do that next
      if (imageFile) {
        const imageUploaded = await uploadImage(formData.email)
        if (!imageUploaded) {
          setSuccess("User data saved, but image upload failed.")
          return
        }
      }

      setSuccess(isEditMode ? "User updated successfully!" : "User created successfully!")

      // Redirect after a short delay
      setTimeout(() => {
        navigate("/users")
      }, 1500)
    } catch (error) {
      console.error("Error saving user:", error)
      setError(error.message || "Failed to save user. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate("/users")} className="mr-4 p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">{isEditMode ? "Edit User" : "Create New User"}</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isEditMode} // Email can't be changed in edit mode
                className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isEditMode ? "bg-gray-100" : ""
                }`}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={!isAdmin} // Only admin can change roles
                className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  !isAdmin ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              >
                <option value="guru">Guru</option>
                <option value="admin">Admin</option>
                <option value="kepalaSekolah">Kepala Sekolah</option>
                <option value="siswa">Siswa</option>
              </select>
              {!isAdmin && (
                <p className="text-xs text-amber-600 mt-1">Hanya admin yang dapat mengubah role pengguna.</p>
              )}
            </div>

            <div>
              <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nama"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="jabatan" className="block text-sm font-medium text-gray-700 mb-1">
                Jabatan
              </label>
              <input
                type="text"
                id="jabatan"
                name="jabatan"
                value={formData.jabatan}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Contoh: Guru Matematika, Kepala Sekolah, dll."
              />
            </div>

            <div>
              <label htmlFor="image_profile" className="block text-sm font-medium text-gray-700 mb-1">
                Profile Image
              </label>
              <input
                type="file"
                id="image_profile"
                name="image_profile"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {isEditMode
                  ? "Upload a new image to replace the current one"
                  : "Select an image for your profile (optional)"}
              </p>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="md:col-span-2 flex justify-center">
                <div className="relative">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Profile Preview"
                    className="w-32 h-32 object-cover rounded-full border-2 border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null)
                      setImageFile(null)
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/users")}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
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
