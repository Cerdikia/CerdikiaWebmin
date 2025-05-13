"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Search,
  RefreshCw,
  Edit,
  Save,
  X,
  Check,
  AlertTriangle,
  Filter,
  ChevronDown,
} from "lucide-react"
import RefreshToken from "../../../components/_common_/RefreshToken"
import Notification from "../../gift/components/Notification"

export default function StudentVerification() {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [notification, setNotification] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState({})
  const [bulkAction, setBulkAction] = useState(null)

  // Messages for verification statuses
  const [messages, setMessages] = useState({
    accept: "Verification successful.",
    rejected: "Sorry, your verification was rejected.",
    waiting: "Your verification is being processed.",
  })

  // Check if user is admin
  const userData = JSON.parse(localStorage.getItem("user_data"))
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (userData && userData.role === "admin") {
      setIsAdmin(true)
    } else {
      setIsAdmin(false)
    }
  }, [userData])

  // Fetch students data
  const fetchStudents = async () => {
    try {
      setLoading(true)
      let response = await fetch(`${import.meta.env.VITE_API_URL}/verifiedes`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      if (response.status === 401) {
        const refreshed = await RefreshToken()
        if (refreshed) {
          response = await fetch(`${import.meta.env.VITE_API_URL}/verifiedes`, {
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
      console.log(data)

      if (data.Data) {
        // Transform data if needed
        const studentsData = data.Data.map((student) => ({
          // ...student,
          id: student.email, // Use Email as unique identifier
          email: student.email,
          nama: student.nama,
          id_kelas: student.id_kelas,
          kelas: student.kelas,
          // verification_status: student.verification_status || "waiting",
          verified_status: student.verified_status || "waiting",
        }))
        setStudents(studentsData)
        setFilteredStudents(studentsData)
      } else {
        setStudents([])
        setFilteredStudents([])
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      setError("Failed to fetch students. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  // Filter students based on search term and selected status
  useEffect(() => {
    let filtered = students

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by verification status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (student) => student.verified_status === selectedStatus,
      )
    }

    setFilteredStudents(filtered)
  }, [searchTerm, selectedStatus, students])

  // Toggle student selection
  // const toggleStudentSelection = (studentId) => {
  const toggleStudentSelection = (email) => {
    setSelectedStudents((prev) => ({
      ...prev,
      // [studentId]: !prev[studentId],
      [email]: !prev[email],
    }))
  }

  // Select/deselect all students
  const toggleSelectAll = () => {
    if (Object.values(selectedStudents).some((selected) => selected)) {
      // If any are selected, deselect all
      setSelectedStudents({})
    } else {
      // Select all filtered students
      const newSelected = {}
      filteredStudents.forEach((student) => {
        // newSelected[student.id_student] = true
        newSelected[student.email] = true
      })
      setSelectedStudents(newSelected)
    }
  }

  // Apply bulk action to selected students
  const applyBulkAction = (status) => {
    setBulkAction(status)
  }

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setSubmitting(true)

      // Get selected student IDs
      const selectedIds = Object.keys(selectedStudents).filter(
        (id) => selectedStudents[id],
      )

      if (selectedIds.length === 0) {
        setNotification({
          type: "error",
          message: "Please select at least one student",
        })
        return
      }

      if (!bulkAction) {
        setNotification({
          type: "error",
          message: "Please select a verification status to apply",
        })
        return
      }

      // Prepare data for API
      // const verificationData = selectedIds.map((id) => ({
      //   id_student: id,
      //   verification_status: bulkAction,
      const verificationData = selectedIds.map((email) => ({
        email: email,
        verification_status: bulkAction,
      }))

      // Prepare notification messages
      // const notificationData = selectedIds.map((id) => ({
      //   id_student: id,
      const notificationData = selectedIds.map((email) => ({
        // email: email,
        // message: messages[bulkAction],
        // form: userData.username || "admin", // Sender - using current admin username
        form: "admin", // Sender - using current admin username
        entity: "personal", // Using role-based messaging
        dest: email, // Recipient email
        subject: `Verification Status: ${bulkAction}`, // Subject line
        message: messages[bulkAction], // Message content
        status: "mengirim", // Initial status
      }))

      // Send verification status updates
      const verificationResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/verifiedes`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({ students: verificationData }),
        },
      )

      if (!verificationResponse.ok) {
        throw new Error("Failed to update verification statuses")
      }

      // Send notification messages
      const messageResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({ notifications: notificationData }),
        },
      )

      if (!messageResponse.ok) {
        throw new Error("Failed to send notification messages")
      }

      // Update local state
      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          // selectedStudents[student.id_student]
          //   ? { ...student, verification_status: bulkAction }
          //   : student,
          selectedStudents[student.email]
            ? { ...student, verified_status: bulkAction }
            : student,
        ),
      )

      // Reset selection and edit mode
      setSelectedStudents({})
      setBulkAction(null)
      setIsEditMode(false)

      setNotification({
        type: "success",
        message: `Successfully updated ${selectedIds.length} student verification status(es)`,
      })
    } catch (error) {
      console.error("Error updating verification status:", error)
      setNotification({
        type: "error",
        message:
          error.message ||
          "An error occurred while updating verification statuses",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Get count of students by verification status
  const getStatusCount = (status) => {
    return students.filter((student) => student.verified_status === status)
      .length
  }

  // Get count of selected students
  const getSelectedCount = () => {
    return Object.values(selectedStudents).filter(Boolean).length
  }

  if (!isAdmin) {
    return (
      <div className="p-8 bg-red-50 rounded-xl border border-red-200">
        <h2 className="text-xl font-semibold text-red-700">Access Denied</h2>
        <p className="mt-2 text-red-600">
          This page is only accessible to administrators.
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Student Verification
        </h1>
        {!isEditMode ? (
          <button
            onClick={() => setIsEditMode(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Edit size={18} />
            <span>Edit Verification Status</span>
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditMode(false)
                setSelectedStudents({})
                setBulkAction(null)
              }}
              className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <X size={18} />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
            >
              {submitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Submit Changes</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div
          className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 cursor-pointer ${selectedStatus === "all" ? "ring-2 ring-indigo-500" : ""}`}
          onClick={() => setSelectedStatus("all")}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">All Students</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">
                {students.length}
              </p>
            </div>
            <div
              className={`p-3 rounded-lg ${selectedStatus === "all" ? "bg-indigo-500" : "bg-indigo-100"}`}
            >
              <Filter
                className={`w-6 h-6 ${selectedStatus === "all" ? "text-white" : "text-indigo-600"}`}
              />
            </div>
          </div>
        </div>

        <div
          className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 cursor-pointer ${selectedStatus === "waiting" ? "ring-2 ring-indigo-500" : ""}`}
          onClick={() => setSelectedStatus("waiting")}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Waiting</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">
                {getStatusCount("waiting")}
              </p>
            </div>
            <div
              className={`p-3 rounded-lg ${selectedStatus === "waiting" ? "bg-amber-500" : "bg-amber-100"}`}
            >
              <AlertTriangle
                className={`w-6 h-6 ${selectedStatus === "waiting" ? "text-white" : "text-amber-600"}`}
              />
            </div>
          </div>
        </div>

        <div
          className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 cursor-pointer ${selectedStatus === "accept" ? "ring-2 ring-indigo-500" : ""}`}
          onClick={() => setSelectedStatus("accept")}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Accepted</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">
                {getStatusCount("accept")}
              </p>
            </div>
            <div
              className={`p-3 rounded-lg ${selectedStatus === "accept" ? "bg-green-500" : "bg-green-100"}`}
            >
              <Check
                className={`w-6 h-6 ${selectedStatus === "accept" ? "text-white" : "text-green-600"}`}
              />
            </div>
          </div>
        </div>

        <div
          className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 cursor-pointer ${selectedStatus === "rejected" ? "ring-2 ring-indigo-500" : ""}`}
          onClick={() => setSelectedStatus("rejected")}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">
                {getStatusCount("rejected")}
              </p>
            </div>
            <div
              className={`p-3 rounded-lg ${selectedStatus === "rejected" ? "bg-red-500" : "bg-red-100"}`}
            >
              <X
                className={`w-6 h-6 ${selectedStatus === "rejected" ? "text-white" : "text-red-600"}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              {isEditMode && (
                <div className="flex gap-2">
                  <button
                    onClick={toggleSelectAll}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {Object.values(selectedStudents).some(
                      (selected) => selected,
                    )
                      ? "Deselect All"
                      : "Select All"}
                  </button>

                  <div className="relative">
                    <button
                      className={`flex items-center gap-2 px-4 py-2 ${bulkAction ? "bg-indigo-600 text-white" : "bg-white border border-gray-300"} rounded-lg hover:${bulkAction ? "bg-indigo-700" : "bg-gray-50"}`}
                    >
                      <span>
                        {bulkAction ? `Set to ${bulkAction}` : "Set Status"}
                      </span>
                      <ChevronDown size={16} />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                      <div className="py-1">
                        <button
                          key="accept"
                          onClick={() => applyBulkAction("accept")}
                          className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                        >
                          <Check className="w-4 h-4 mr-2 text-green-500" />
                          Set to Accepted
                        </button>
                        <button
                          key="rejected"
                          onClick={() => applyBulkAction("rejected")}
                          className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                        >
                          <X className="w-4 h-4 mr-2 text-red-500" />
                          Set to Rejected
                        </button>
                        <button
                          key="waiting"
                          onClick={() => applyBulkAction("waiting")}
                          className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                        >
                          <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
                          Set to Waiting
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={fetchStudents}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw size={18} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {isEditMode && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Select
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verification Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    // <tr key={student.id_student} className="hover:bg-gray-50">
                    <tr key={student.email} className="hover:bg-gray-50">
                      {isEditMode && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            // checked={!!selectedStudents[student.id_student]}
                            // onChange={() =>
                            //   toggleStudentSelection(student.id_student)
                            // }
                            checked={!!selectedStudents[student.email]}
                            onChange={() =>
                              toggleStudentSelection(student.email)
                            }
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover border border-gray-200"
                              src={
                                student.image_profile || "/img/default_user.png"
                              }
                              alt={student.nama}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.nama || "No Name"}
                            </div>
                            {/* <div className="text-sm text-gray-500">
                              ID: {student.id_student}
                            </div> */}
                            <div className="text-sm text-gray-500">
                              Email: {student.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {student.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {student.kelas || "Not assigned"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            student.verified_status === "accept"
                              ? "bg-green-100 text-green-800"
                              : student.verified_status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {student.verified_status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    {/* <tr key="no-students-row"> */}
                    <td
                      colSpan={isEditMode ? 5 : 4}
                      className="px-6 py-12 text-center text-sm text-gray-500"
                    >
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium">{filteredStudents.length}</span>{" "}
            students
          </div>
          {isEditMode && getSelectedCount() > 0 && (
            <div className="text-sm text-gray-700">
              <span className="font-medium">{getSelectedCount()}</span> students
              selected
            </div>
          )}
        </div>
      </div>

      {/* Verification Messages Section */}
      {isEditMode && bulkAction && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Verification Message</h2>
          <div className="mb-4">
            <label
              htmlFor="verification-message"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Message for {bulkAction} status:
            </label>
            <textarea
              id="verification-message"
              value={messages[bulkAction]}
              onChange={(e) =>
                setMessages({ ...messages, [bulkAction]: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows="3"
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">
              This message will be sent to all selected students when their
              verification status is updated.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
