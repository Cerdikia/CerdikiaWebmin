"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Pencil, Trash2, Search, RefreshCw, Filter, UserPlus, Users, ChevronDown, MoreHorizontal } from "lucide-react"
import RefreshToken from "../../../components/_common_/RefreshToken"
import DeleteUserModal from "../components/DeleteUserModal"

export default function UserList() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("guru") // Default to guru
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [stats, setStats] = useState({
    guru: 0,
    admin: 0,
    kepalaSekolah: 0,
    total: 0,
  })

  // Update the fetchUsers function to use the correct endpoint and handle the response structure
  const fetchUsers = async () => {
    setLoading(true)
    setError(null)

    try {
      let response = await fetch(`${import.meta.env.VITE_API_URL}/getAllUsers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      if (response.status === 401) {
        const refreshed = await RefreshToken()
        if (refreshed) {
          response = await fetch(`${import.meta.env.VITE_API_URL}/getAllUsers`, {
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

      if (data.Message === "Data retrieved successfully" && data.Data) {
        // Store all users and filter by role in the UI
        setUsers(data.Data)

        // Calculate stats
        const stats = {
          guru: data.Data.filter((user) => user.role === "guru").length,
          admin: data.Data.filter((user) => user.role === "admin").length,
          kepalaSekolah: data.Data.filter((user) => user.role === "kepalaSekolah").length,
          total: data.Data.length,
        }
        setStats(stats)
      } else {
        setUsers([])
        setError("No users found or error fetching data")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      setError("Failed to fetch users. Please try again.")
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  // Update the useEffect to not depend on selectedRole since we're filtering client-side now
  useEffect(() => {
    fetchUsers()
  }, []) // Remove selectedRole dependency

  // Update the filteredUsers to filter by both search term and selected role
  const filteredUsers = users.filter(
    (user) =>
      user.role === selectedRole && // Filter by selected role
      (user.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Update the handleDeleteConfirm function to use the correct role from the user object
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/deleteDataUser`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          email: userToDelete.email,
          role: userToDelete.role,
        }),
      })

      if (response.ok) {
        // Remove the deleted user from the list
        setUsers(users.filter((user) => user.email !== userToDelete.email))
        setIsDeleteModalOpen(false)
        setUserToDelete(null)
      } else {
        const errorData = await response.json()
        setError(`Failed to delete user: ${errorData.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      setError("Failed to delete user. Please try again.")
    }
  }

  const handleDeleteClick = (user) => {
    setUserToDelete(user)
    setIsDeleteModalOpen(true)
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header with stats */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-500">Manage all users, roles, and permissions</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 rounded-lg bg-indigo-100">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div
          className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 ${selectedRole === "guru" ? "ring-2 ring-indigo-500" : ""}`}
          onClick={() => setSelectedRole("guru")}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Guru</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">{stats.guru}</p>
            </div>
            <div className={`p-3 rounded-lg ${selectedRole === "guru" ? "bg-indigo-500" : "bg-indigo-100"}`}>
              <Users className={`w-6 h-6 ${selectedRole === "guru" ? "text-white" : "text-indigo-600"}`} />
            </div>
          </div>
        </div>

        <div
          className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 ${selectedRole === "admin" ? "ring-2 ring-indigo-500" : ""}`}
          onClick={() => setSelectedRole("admin")}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Admin</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">{stats.admin}</p>
            </div>
            <div className={`p-3 rounded-lg ${selectedRole === "admin" ? "bg-indigo-500" : "bg-indigo-100"}`}>
              <Users className={`w-6 h-6 ${selectedRole === "admin" ? "text-white" : "text-indigo-600"}`} />
            </div>
          </div>
        </div>

        <div
          className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 ${selectedRole === "kepalaSekolah" ? "ring-2 ring-indigo-500" : ""}`}
          onClick={() => setSelectedRole("kepalaSekolah")}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Kepala Sekolah</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">{stats.kepalaSekolah}</p>
            </div>
            <div className={`p-3 rounded-lg ${selectedRole === "kepalaSekolah" ? "bg-indigo-500" : "bg-indigo-100"}`}>
              <Users className={`w-6 h-6 ${selectedRole === "kepalaSekolah" ? "text-white" : "text-indigo-600"}`} />
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <div className="relative inline-block">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter size={18} />
                  <span>Filter</span>
                  <ChevronDown size={16} />
                </button>
                {/* Dropdown menu would go here */}
              </div>

              <button
                onClick={fetchUsers}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw size={18} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <Link
                to="/users/new"
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <UserPlus size={18} />
                <span className="hidden sm:inline">Add User</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full object-cover border border-gray-200"
                              src={user.image_profile || "/img/default_user.png"}
                              alt={user.nama}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.nama || "No Name"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 capitalize">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{new Date(user.date_created).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/users/edit/${user.email}`}
                            state={{ user, role: user.role }}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                          >
                            <Pencil size={16} />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="relative inline-block">
                            <button className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100">
                              <MoreHorizontal size={16} />
                            </button>
                            {/* Dropdown menu would go here */}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center">
                        <Users className="w-12 h-12 text-gray-300 mb-2" />
                        <p className="text-gray-500 mb-1">No users found</p>
                        <p className="text-gray-400 text-xs">Try changing your search or filter criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer with pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{filteredUsers.length}</span> users
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              Previous
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </div>

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setUserToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        user={userToDelete}
      />
    </div>
  )
}
