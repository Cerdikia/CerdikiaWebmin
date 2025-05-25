"use client"

import { useState, useEffect } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { ArrowLeft, Save, Loader2, Plus, X, AlertTriangle } from "lucide-react"
import RefreshToken from "../../../components/_common_/RefreshToken"

export default function UserForm() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const isEditMode = !!id

  // Get user data from location state if available (for edit mode)
  const userFromState = location.state?.user
  const roleFromState = location.state?.role

  // Replace the entire formData state with this updated version that includes all possible fields
  const [formData, setFormData] = useState({
    email: "",
    nama: "",
    jabatan: "", // For guru and kepalaSekolah
    keterangan: "", // For admin
    id_kelas: "", // For siswa
  })

  // Add state to track initial form data for comparison
  const [initialFormData, setInitialFormData] = useState({
    email: "",
    nama: "",
    jabatan: "",
    keterangan: "",
    id_kelas: "",
  })

  const [role, setRole] = useState(roleFromState || "guru")
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Add state for subjects (mapel)
  const [allSubjects, setAllSubjects] = useState([])
  const [selectedSubjects, setSelectedSubjects] = useState([])
  const [initialSubjects, setInitialSubjects] = useState([])
  const [loadingSubjects, setLoadingSubjects] = useState(false)

  // Define jabatan options
  const jabatanOptions = [
    { value: "walikelas", label: "Wali Kelas" },
    { value: "inggris", label: "Guru Bahasa Inggris" },
    { value: "daerah", label: "Guru Bahasa Daerah" },
    { value: "olahraga", label: "Guru Olahraga" },
  ]

  // Add this function to fetch available classes for students
  const [classes, setClasses] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(false)

  const fetchClasses = async () => {
    if (role === "siswa") {
      setLoadingClasses(true)
      try {
        const response = await fetch(`${window.env.VITE_API_URL}/kelas`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          console.log("kelas", data)

          if (data) {
            setClasses(data)
          }
        }
      } catch (error) {
        console.error("Error fetching classes:", error)
      } finally {
        setLoadingClasses(false)
      }
    }
  }

  // Function to fetch all subjects
  const fetchSubjects = async () => {
    if (role === "guru") {
      setLoadingSubjects(true)
      try {
        const response = await fetch(
          `${window.env.VITE_API_URL}/genericAllMapels`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          },
        )

        if (response.ok) {
          const data = await response.json()
          // Updated to handle the correct API response structure
          if (
            data.Message === "success get data mapel" &&
            Array.isArray(data.Data)
          ) {
            setAllSubjects(data.Data)
          }
        }
      } catch (error) {
        console.error("Error fetching subjects:", error)
      } finally {
        setLoadingSubjects(false)
      }
    }
  }

  // Function to fetch teacher's subjects in edit mode
  const fetchTeacherSubjects = async (teacherId) => {
    if (role === "guru" && teacherId) {
      try {
        const response = await fetch(
          `${window.env.VITE_API_URL}/guru/${teacherId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          },
        )

        if (response.ok) {
          const data = await response.json()
          console.log("guru mapel response")
          console.log(data)
          if (data && Array.isArray(data.mapel)) {
            setSelectedSubjects(data.mapel)
            setInitialSubjects(data.mapel)
          }
        }
      } catch (error) {
        console.error("Error fetching teacher subjects:", error)
      }
    }
  }

  // Function to check if form data has changed
  const hasFormDataChanged = () => {
    // For different roles, compare only the relevant fields
    if (roleFromState === "siswa") {
      return (
        formData.nama !== initialFormData.nama ||
        formData.id_kelas !== initialFormData.id_kelas
      )
    } else if (roleFromState === "guru") {
      return (
        formData.nama !== initialFormData.nama ||
        formData.jabatan !== initialFormData.jabatan
      )
    } else if (roleFromState === "kepalaSekolah") {
      return formData.nama !== initialFormData.nama
    } else if (roleFromState === "admin") {
      return (
        formData.nama !== initialFormData.nama ||
        formData.keterangan !== initialFormData.keterangan
      )
    }
    return false
  }

  // Update the useEffect to handle all role-specific fields
  useEffect(() => {
    // Fetch classes for students
    fetchClasses()

    // Fetch subjects for teachers
    fetchSubjects()

    // Check if current user is admin - directly from localStorage
    const currentUserRole = localStorage.getItem("user_data")
      ? JSON.parse(localStorage.getItem("user_data")).role
      : null
    setIsAdmin(currentUserRole === "admin")

    // If we have user data from state, use it
    if (userFromState) {
      // const initialFormData = {
      const newFormData = {
        email: userFromState.email || "",
        nama: userFromState.nama || "",
        jabatan: userFromState.jabatan || "",
        keterangan: userFromState.keterangan || "",
        id_kelas: userFromState.id_kelas || "",
      }

      // setFormData(initialFormData)
      setFormData(newFormData)
      setInitialFormData(newFormData) // Store initial form data for comparison

      // Set image preview if there's an existing image_profile
      if (userFromState.image_profile) {
        setImagePreview(userFromState.image_profile)
      }

      // If it's a teacher, fetch their subjects
      if (roleFromState === "guru" && userFromState.id) {
        fetchTeacherSubjects(userFromState.id)
      }

      return
    }
    // If in edit mode but no user data in state, fetch it
    if (isEditMode && id) {
      fetchUserData()
    }
  }, [isEditMode, id, userFromState, role])

  // Update the fetchUserData function to handle all role-specific fields
  const fetchUserData = async () => {
    setLoading(true)
    setError(null)

    try {
      let response = await fetch(
        `${window.env.VITE_API_URL}/actor/${role}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      )

      if (response.status === 401) {
        const refreshed = await RefreshToken()
        if (refreshed) {
          response = await fetch(
            `${window.env.VITE_API_URL}/actor/${role}/${id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              },
            },
          )
        } else {
          navigate("/login", { replace: true })
          return
        }
      }

      const data = await response.json()

      if (data.Message === "Success" && data.Data) {
        const userData = data.Data

        // Create a base form data object with common fields
        const newFormData = {
          email: userData.email || "",
          nama: userData.nama || "",
          jabatan: "",
          keterangan: "",
          id_kelas: "",
        }

        // Add role-specific fields
        if (role === "siswa") {
          newFormData.id_kelas = userData.id_kelas || ""
        } else if (role === "guru" || role === "kepalaSekolah") {
          newFormData.jabatan = userData.jabatan || ""
        } else if (role === "admin") {
          newFormData.keterangan = userData.keterangan || ""
        }

        setFormData(newFormData)
        setInitialFormData(newFormData) // Store initial form data for comparison

        // Set image preview if there's an existing image_profile
        if (userData.image_profile) {
          setImagePreview(userData.image_profile)
        }

        // If it's a teacher, fetch their subjects
        if (role === "guru" && userData.id) {
          fetchTeacherSubjects(userData.id)
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

  // Function to handle adding a subject - updated to use id_mapel
  const handleAddSubject = (e) => {
    const subjectId = e.target.value
    if (!subjectId) return // Skip if no subject is selected

    const subjectIdNum = Number.parseInt(subjectId, 10)

    // Check if this subject is already selected
    if (!selectedSubjects.some((s) => s.id_mapel === subjectIdNum)) {
      const subject = allSubjects.find((s) => s.id_mapel === subjectIdNum)
      if (subject) {
        setSelectedSubjects([
          ...selectedSubjects,
          {
            id_mapel: subject.id_mapel,
            mapel: subject.mapel,
          },
        ])

        // Reset the select to the default option
        e.target.value = ""
      }
    }
  }

  // Function to remove a subject
  const handleRemoveSubject = (subjectId) => {
    setSelectedSubjects(
      selectedSubjects.filter((s) => s.id_mapel !== subjectId),
    )
  }

  // Function to check if subjects have changed
  const haveSubjectsChanged = () => {
    if (selectedSubjects.length !== initialSubjects.length) return true

    const initialIds = new Set(initialSubjects.map((s) => s.id_mapel))
    return selectedSubjects.some((s) => !initialIds.has(s.id_mapel))
  }

  // Function to upload image
  const uploadImage = async (email) => {
    if (!imageFile) return true // Skip if no image to upload

    try {
      const formDataImage = new FormData()
      formDataImage.append("image", imageFile)

      const response = await fetch(
        `${window.env.VITE_API_URL}/patchImageProfile/${role}/${email}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: formDataImage,
        },
      )

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

  // Function to delete all teacher-subject relations
  const deleteAllTeacherSubjects = async (teacherId) => {
    if (!teacherId) return true

    try {
      const response = await fetch(
        `${window.env.VITE_API_URL}/guru_mapel/batch`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({
            teacher_ids: [teacherId],
          }),
        },
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete teacher subjects")
      }

      setSelectedSubjects([])
      return true
    } catch (error) {
      console.error("Error deleting teacher subjects:", error)
      setError("Failed to delete subject assignments. Please try again.")
      return false
    }
  }

  // Function to save teacher-subject relations
  const saveTeacherSubjects = async (teacherId) => {
    if (role !== "guru" || !teacherId) return true

    // try {
    // if (isEditMode) {
    //   const initialIds = new Set(initialSubjects.map((s) => s.id_mapel))
    //   const currentIds = new Set(selectedSubjects.map((s) => s.id_mapel))

    //   // If no changes, skip the update
    //   if (
    //     initialSubjects.length === selectedSubjects.length &&
    //     [...initialIds].every((id) => currentIds.has(id))
    //   ) {
    // Skip if no changes to subjects in edit mode
    if (isEditMode && !haveSubjectsChanged()) {
      return true
    }

    try {
      // If in edit mode, use batch update to replace all subjects
      if (isEditMode) {
        const response = await fetch(
          `${window.env.VITE_API_URL}/guru_mapel/batch`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            body: JSON.stringify({
              teachers: [
                {
                  id_guru: teacherId,
                  id_mapels: selectedSubjects.map((s) => s.id_mapel),
                },
              ],
            }),
          },
        )

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to update teacher subjects")
        }
      } else {
        // For new teachers, use batch add
        if (selectedSubjects.length === 0) return true

        const response = await fetch(
          `${window.env.VITE_API_URL}/guru_mapel/batch`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            body: JSON.stringify({
              teachers: [
                {
                  id_guru: teacherId,
                  id_mapels: selectedSubjects.map((s) => s.id_mapel),
                },
              ],
            }),
          },
        )

        if (!response.ok) {
          const data = await response.json()
          // throw new Error(data.error || "Failed to save teacher subjects")
          throw new Error(data.error || "Failed to add teacher subjects")
        }
      }

      return true
    } catch (error) {
      console.error("Error saving teacher subjects:", error)
      setError(
        "User data saved, but failed to save subject assignments. Please try again.",
      )
      return false
    }
  }

  // Replace the handleSubmit function with this improved version
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Check if we're in edit mode and the role has changed
      if (isEditMode && role !== roleFromState) {
        // Call the changeUserRole endpoint
        const roleChangeResponse = await fetch(
          `${window.env.VITE_API_URL}/changeUserRole`,
          {
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
          },
        )

        if (!roleChangeResponse.ok) {
          const roleChangeData = await roleChangeResponse.json()
          throw new Error(
            roleChangeData.message || "Failed to change user role",
          )
        }

        setSuccess("User role changed successfully!")

        // Add a delay to ensure the backend has processed the role change
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // After changing the role, we need to fetch the user data again to get the correct structure
        // This ensures we have the right data format for the new role
        try {
          const userResponse = await fetch(
            `${window.env.VITE_API_URL}/getDataUser?email=${formData.email}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              },
            },
          )

          if (userResponse.ok) {
            const userData = await userResponse.json()
            if (userData.message === "Success" && userData.data) {
              // If the new role is guru, save the subject relations
              if (role === "guru" && userData.data.id) {
                await saveTeacherSubjects(userData.data.id)
              }

              // Redirect after a short delay - the role change was successful
              setTimeout(() => {
                navigate("/users")
              }, 1500)
              return
            }
          }
        } catch (error) {
          console.error("Error fetching updated user data:", error)
        }

        // If we couldn't fetch the updated user data, try to update with the current form data
        // Prepare the data based on the new role
        const roleSpecificData = {
          email: formData.email,
          nama: formData.nama,
        }

        // Add role-specific fields
        if (role === "siswa") {
          roleSpecificData.id_kelas = Number.parseInt(formData.id_kelas, 10)
          if (isNaN(roleSpecificData.id_kelas)) {
            throw new Error(
              "Kelas harus dipilih dan merupakan angka yang valid",
            )
          }
        } else if (role === "guru") {
          roleSpecificData.jabatan = formData.jabatan
        } else if (role === "kepalaSekolah") {
          roleSpecificData.jabatan = "kepala sekolah" // Always set this value for kepalaSekolah
        } else if (role === "admin") {
          roleSpecificData.keterangan = formData.keterangan
        }

        // Update user data with the new role-specific data
        try {
          const updateResponse = await fetch(
            `${window.env.VITE_API_URL}/editDataUser/${role}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              },
              body: JSON.stringify(roleSpecificData),
            },
          )

          if (!updateResponse.ok) {
            const updateData = await updateResponse.json()
            console.warn(
              "Warning: Could not update user data after role change:",
              updateData.message,
            )
            // Don't throw error here, as the role change was successful
          } else {
            setSuccess("User role changed and data updated successfully!")
          }
        } catch (error) {
          console.warn(
            "Warning: Error updating user data after role change:",
            error,
          )
          // Don't throw error here, as the role change was successful
        }

        // Redirect after a short delay - the role change was successful even if the update wasn't
        setTimeout(() => {
          navigate("/users")
        }, 1500)
        return
      } else if (isEditMode) {
        // Check if any data has changed before updating
        const dataChanged = hasFormDataChanged()
        const subjectsChanged =
          roleFromState === "guru" && haveSubjectsChanged()

        // If nothing has changed, skip the update
        if (!dataChanged && !subjectsChanged && !imageFile) {
          setSuccess("No changes detected. User data remains the same.")
          setTimeout(() => {
            navigate("/users")
          }, 1500)
          return
        }

        // Only update user data if it has changed
        if (dataChanged) {
          const roleSpecificData = {
            email: formData.email,
            nama: formData.nama,
          }

          // Add role-specific fields
          if (roleFromState === "siswa") {
            roleSpecificData.id_kelas = Number.parseInt(formData.id_kelas, 10)
            if (isNaN(roleSpecificData.id_kelas)) {
              throw new Error(
                "Kelas harus dipilih dan merupakan angka yang valid",
              )
            }
          } else if (roleFromState === "guru") {
            roleSpecificData.jabatan = formData.jabatan
          } else if (roleFromState === "kepalaSekolah") {
            roleSpecificData.jabatan = "kepala sekolah" // Always set this value for kepalaSekolah
          } else if (roleFromState === "admin") {
            roleSpecificData.keterangan = formData.keterangan
          }

          const response = await fetch(
            `${window.env.VITE_API_URL}/editDataUser/${roleFromState}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              },
              body: JSON.stringify(roleSpecificData),
            },
          )

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || "Failed to save user data")
          }
        }

        // If it's a teacher, save the subject relations
        // if (roleFromState === "guru" && userFromState && userFromState.id) {
        // If it's a teacher, save the subject relations if they've changed
        if (
          roleFromState === "guru" &&
          userFromState &&
          userFromState.id &&
          subjectsChanged
        ) {
          await saveTeacherSubjects(userFromState.id)
        }
      } else {
        // Create new user
        // Prepare the data based on the selected role
        const roleSpecificData = {
          email: formData.email,
          nama: formData.nama,
        }

        // Add role-specific fields
        if (role === "siswa") {
          roleSpecificData.id_kelas = Number.parseInt(formData.id_kelas, 10)
          if (isNaN(roleSpecificData.id_kelas)) {
            throw new Error(
              "Kelas harus dipilih dan merupakan angka yang valid",
            )
          }
        } else if (role === "guru") {
          roleSpecificData.jabatan = formData.jabatan
        } else if (role === "kepalaSekolah") {
          roleSpecificData.jabatan = "kepala sekolah" // Always set this value for kepalaSekolah
        } else if (role === "admin") {
          roleSpecificData.keterangan = formData.keterangan
        }

        const response = await fetch(
          `${window.env.VITE_API_URL}/register/${role}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            body: JSON.stringify(roleSpecificData),
          },
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Failed to save user data")
        }

        // If it's a teacher, save the subject relations
        // First, we need to get the teacher's ID
        if (role === "guru") {
          try {
            const teacherResponse = await fetch(
              `${window.env.VITE_API_URL}/getDataUser?email=${formData.email}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
              },
            )

            if (teacherResponse.ok) {
              const teacherData = await teacherResponse.json()
              if (
                teacherData.message === "Success" &&
                teacherData.data &&
                teacherData.data.id
              ) {
                await saveTeacherSubjects(teacherData.data.id)
              }
            }
          } catch (error) {
            console.error("Error fetching teacher ID:", error)
          }
        }
      }

      // If user data was saved successfully and we have an image to upload, do that next
      if (imageFile) {
        console.log("New image detected, uploading...")
        const imageUploaded = await uploadImage(formData.email)
        if (!imageUploaded) {
          setSuccess("User data saved, but image upload failed.")
          return
        }
      }

      setSuccess(
        isEditMode
          ? "User updated successfully!"
          : "User created successfully!",
      )

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
        <button
          onClick={() => navigate("/users")}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">
          {isEditMode ? "Edit User" : "Create New User"}
        </h1>
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
          {/* Replace the form fields section with this updated version that shows role-specific fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
                <p className="text-xs text-amber-600 mt-1">
                  Hanya admin yang dapat mengubah role pengguna.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="nama"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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

            {/* Conditional fields based on role */}
            {role === "guru" && (
              <>
                <div>
                  <label
                    htmlFor="jabatan"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Jabatan <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="jabatan"
                    name="jabatan"
                    value={formData.jabatan}
                    onChange={handleChange}
                    required
                    // className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={!isAdmin} // Only admin can change roles
                    className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      !isAdmin ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  >
                    <option value="">Pilih Jabatan</option>
                    {jabatanOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {!isAdmin && (
                    <p className="text-xs text-amber-600 mt-1">
                      Hanya admin yang dapat mengubah role pengguna.
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  {/* <label className="block text-sm font-medium text-gray-700 mb-1"> */}
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Pilih Mata Pelajaran yang Ditangani
                    </label>
                    {isAdmin && isEditMode && selectedSubjects.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Apakah Anda yakin ingin menghapus semua mata pelajaran?",
                            )
                          ) {
                            if (userFromState && userFromState.id) {
                              deleteAllTeacherSubjects(userFromState.id)
                            }
                          }
                        }}
                        className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center"
                      >
                        <AlertTriangle size={12} className="mr-1" />
                        Hapus Semua
                      </button>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      id="subject-select"
                      className={`flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500${
                        !isAdmin ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      onChange={handleAddSubject}
                      // disabled={loadingSubjects}
                      disabled={loadingSubjects || !isAdmin}
                      value=""
                    >
                      <option value="">Pilih Mata Pelajaran</option>
                      {allSubjects.map((subject) => (
                        <option key={subject.id_mapel} value={subject.id_mapel}>
                          {subject.mapel}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className={`p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 ${
                        !isAdmin ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      // onClick={() =>
                      //   document.getElementById("subject-select").focus()
                      // }
                      onClick={() => {
                        if (isAdmin) {
                          document.getElementById("subject-select").focus()
                        }
                      }}
                      disabled={!isAdmin}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  {loadingSubjects && (
                    <p className="text-xs text-gray-500 mt-1">
                      Loading mata pelajaran...
                    </p>
                  )}

                  {selectedSubjects.length > 0 && (
                    <div className="mt-3">
                      {/* <p className="text-sm font-medium text-gray-700 mb-2">
                        Mata Pelajaran yang Dipilih:
                      </p> */}
                      <div className="flex flex-wrap gap-2">
                        {selectedSubjects.map((subject) => (
                          <span
                            key={subject.id_mapel}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 ${
                              !isAdmin ? "bg-gray-100 cursor-not-allowed" : ""
                            }`}
                          >
                            {subject.mapel}
                            {/* <button
                              type="button"
                              onClick={() =>
                                handleRemoveSubject(subject.id_mapel)
                              }
                              className="ml-1.5 text-indigo-600 hover:text-indigo-800"
                            >
                              <X size={16} />
                            </button> */}
                            <button
                              type="button"
                              onClick={() => {
                                if (isAdmin) {
                                  handleRemoveSubject(subject.id_mapel)
                                }
                              }}
                              disabled={!isAdmin}
                              className={`ml-1.5 text-indigo-600 hover:text-indigo-800 ${
                                !isAdmin
                                  ? "cursor-not-allowed hover:text-gray-400"
                                  : ""
                              }`}
                            >
                              <X size={16} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {role === "admin" && (
              <div>
                <label
                  htmlFor="keterangan"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Keterangan
                </label>
                <input
                  type="text"
                  id="keterangan"
                  name="keterangan"
                  value={formData.keterangan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Contoh: System Administrator, dll."
                />
              </div>
            )}

            {role === "siswa" && (
              <div>
                <label
                  htmlFor="id_kelas"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Kelas <span className="text-red-500">*</span>
                </label>
                <select
                  id="id_kelas"
                  name="id_kelas"
                  value={formData.id_kelas}
                  onChange={handleChange}
                  required={role === "siswa"}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={loadingClasses}
                >
                  <option value="">Pilih Kelas</option>
                  {classes.map((kelas) => (
                    <option key={kelas.id} value={kelas.id}>
                      {kelas.kelas}
                    </option>
                  ))}
                </select>
                {loadingClasses && (
                  <p className="text-xs text-gray-500 mt-1">Loading kelas...</p>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="image_profile"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
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
