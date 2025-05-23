"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Search,
  RefreshCw,
  Filter,
  Eye,
  Trash2,
  Package,
  Calendar,
  Diamond,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react"
import RefreshToken from "../../../components/_common_/RefreshToken"
import Notification from "../components/Notification"

export default function RedemptionList() {
  const navigate = useNavigate()
  const [redemptions, setRedemptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [notification, setNotification] = useState(null)
  const userData = JSON.parse(localStorage.getItem("user_data"))
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (userData && userData.role === "admin") {
      setIsAdmin(true)
    } else {
      setIsAdmin(false)
    }
  }, [userData])

  const fetchRedemptions = async () => {
    try {
      setLoading(true)
      let url = `${window.env.VITE_API_URL}/redemptions`

      // Add query parameters if filters are set
      const params = new URLSearchParams()
      if (statusFilter) {
        params.append("status", statusFilter)
      }
      if (params.toString()) {
        url += `?${params.toString()}`
      }

      let response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      if (response.status === 401) {
        const refreshed = await RefreshToken()
        if (refreshed) {
          response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          })
        } else {
          window.location.href = "/login"
          return
        }
      }

      const data = await response.json()

      console.log(data)

      if (data.data) {
        setRedemptions(data.data)
      } else {
        setRedemptions([])
      }
    } catch (error) {
      console.error("Fetch error:", error)
      setError("Failed to fetch redemptions. Please try again.")
      setRedemptions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRedemptions()
  }, [statusFilter])

  // Filter redemptions based on search term
  const filteredRedemptions = redemptions.filter((redemption) => {
    return (
      redemption.nama_siswa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      redemption.nama_barang
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      redemption.kode_penukaran
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      redemption.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleViewReceipt = (code) => {
    navigate(`/gifts/receipt/${code}`)
  }

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(
        `${window.env.VITE_API_URL}/redemptions/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      )

      if (response.ok) {
        // Update the redemption status in the state
        setRedemptions(
          redemptions.map((redemption) =>
            redemption.id_log === id
              ? { ...redemption, status_penukaran: newStatus }
              : redemption,
          ),
        )
        setNotification({
          type: "success",
          message: `Redemption status updated to ${newStatus}!`,
        })
      } else {
        setNotification({
          type: "error",
          message: "Failed to update redemption status",
        })
      }
    } catch (error) {
      console.error("Error updating status:", error)
      setNotification({
        type: "error",
        message: "An error occurred while updating the status",
      })
    }
  }

  const handleDeleteRedemption = async (id) => {
    if (!confirm("Are you sure you want to delete this redemption?")) return

    try {
      const response = await fetch(
        `${window.env.VITE_API_URL}/redemptions/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      )

      if (response.ok) {
        // Remove the deleted item from the state
        setRedemptions(
          redemptions.filter((redemption) => redemption.id_log !== id),
        )
        setNotification({
          type: "success",
          message: "Redemption successfully deleted!",
        })
      } else {
        setNotification({
          type: "error",
          message: "Failed to delete redemption",
        })
      }
    } catch (error) {
      console.error("Error deleting redemption:", error)
      setNotification({
        type: "error",
        message: "An error occurred while deleting the redemption",
      })
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "menunggu":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock size={12} className="mr-1" />
            Menunggu
          </span>
        )
      case "selesai":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" />
            Selesai
          </span>
        )
      case "dibatalkan":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={12} className="mr-1" />
            Dibatalkan
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Gift Redemptions</h1>
      </div>

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
                placeholder="Search by student name, email, item name, or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                >
                  <option value="">All Statuses</option>
                  <option value="menunggu">Menunggu</option>
                  <option value="selesai">Selesai</option>
                  <option value="dibatalkan">Dibatalkan</option>
                </select>
                <Filter
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
              </div>

              <button
                onClick={fetchRedemptions}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw size={18} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Redemption Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRedemptions.length > 0 ? (
                  filteredRedemptions.map((redemption) => (
                    <tr key={redemption.id_log} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={
                                // "http://" + redemption.img || "/placeholder.svg"
                                redemption.img || "/placeholder.svg"
                              }
                              alt={redemption.nama_barang}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src =
                                  "/placeholder.svg?height=40&width=40"
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {redemption.nama_barang}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Package size={14} className="mr-1" />
                              Qty: {redemption.jumlah}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Diamond
                                size={14}
                                className="mr-1 text-blue-500"
                              />
                              {redemption.diamond} × {redemption.jumlah} ={" "}
                              {redemption.diamond * redemption.jumlah}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {redemption.nama_siswa}
                        </div>
                        <div className="text-sm text-gray-500">
                          {redemption.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-indigo-600">
                          {redemption.kode_penukaran}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {formatDate(redemption.tanggal_penukaran)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(redemption.status_penukaran)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                            onClick={() =>
                              handleViewReceipt(redemption.kode_penukaran)
                            }
                            title="View Receipt"
                          >
                            <Eye size={16} />
                          </button>

                          {redemption.status_penukaran === "menunggu" && (
                            <button
                              className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                              onClick={() =>
                                handleUpdateStatus(redemption.id_log, "selesai")
                              }
                              title="Mark as Completed"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}

                          {redemption.status_penukaran === "menunggu" && (
                            <button
                              className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                              onClick={() =>
                                handleUpdateStatus(
                                  redemption.id_log,
                                  "dibatalkan",
                                )
                              }
                              title="Cancel Redemption"
                            >
                              <XCircle size={16} />
                            </button>
                          )}

                          <button
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                            onClick={() =>
                              handleDeleteRedemption(redemption.id_log)
                            }
                            title="Delete Redemption"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-sm text-gray-500"
                    >
                      <div className="flex flex-col items-center">
                        <Package className="w-12 h-12 text-gray-300 mb-2" />
                        <p className="text-gray-500 mb-1">
                          No redemptions found
                        </p>
                        <p className="text-gray-400 text-xs">
                          {statusFilter
                            ? `No ${statusFilter} redemptions found. Try a different filter.`
                            : "No redemptions have been made yet."}
                        </p>
                      </div>
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
            <span className="font-medium">{filteredRedemptions.length}</span>{" "}
            redemptions
          </div>
        </div>
      </div>
    </div>
  )
}
