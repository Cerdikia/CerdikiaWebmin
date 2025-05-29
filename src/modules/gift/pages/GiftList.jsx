"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Search,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Gift,
  Diamond,
} from "lucide-react"
import RefreshToken from "../../../components/_common_/RefreshToken"
import DeleteGiftModal from "../components/DeleteGiftModal"
import Notification from "../components/Notification"

export default function GiftList() {
  const navigate = useNavigate()
  const [gifts, setGifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const userData = JSON.parse(localStorage.getItem("user_data"))
  const [isAdmin, setIsAdmin] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [giftToDelete, setGiftToDelete] = useState(null)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    if (userData && userData.role === "admin") {
      setIsAdmin(true)
    } else {
      setIsAdmin(false)
    }
  }, [userData])

  const fetchGifts = async () => {
    try {
      setLoading(true)
      let response = await fetch(`${window.env.VITE_API_URL}/gifts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      if (response.status === 401) {
        const refreshed = await RefreshToken()
        if (refreshed) {
          response = await fetch(`${window.env.VITE_API_URL}/gifts`, {
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

      // console.log(data)

      if (data.Data) {
        setGifts(data.Data)
      } else {
        setGifts([])
      }
    } catch (error) {
      console.error("Fetch error:", error)
      setError("Failed to fetch gifts. Please try again.")
      setGifts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGifts()
  }, [])

  // Filter gifts based on search term
  const filteredGifts = gifts.filter((gift) => {
    // return gift.name?.toLowerCase().includes(searchTerm.toLowerCase())
    return gift.nama_barang?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // const handleDeleteGift = async (id) => {
  //   if (!confirm("Are you sure you want to delete this gift?")) return

  const handleDeleteClick = (gift) => {
    setGiftToDelete(gift)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!giftToDelete) return

    try {
      // const response = await fetch(
      //   `${import.meta.env.VITE_API_URL}/gifts/${id}`,{
      const response = await fetch(
        `${window.env.VITE_API_URL}/gifts/${giftToDelete.id_barang}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      )

      if (response.ok) {
        // Remove the deleted item from the state
        // setGifts(gifts.filter((gift) => gift.id !== id))
        // alert("Gift successfully deleted")
        setGifts(
          gifts.filter((gift) => gift.id_barang !== giftToDelete.id_barang),
        )
        setNotification({
          type: "success",
          message: "Gift successfully deleted!",
        })
      } else {
        // alert("Failed to delete gift")
        setNotification({
          type: "error",
          message: "Failed to delete gift",
        })
      }
    } catch (error) {
      console.error("Error deleting gift:", error)
      // alert("An error occurred while deleting the gift")
      setNotification({
        type: "error",
        message: "An error occurred while deleting the gift",
      })
    } finally {
      setDeleteModalOpen(false)
      setGiftToDelete(null)
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
        <h1 className="text-2xl font-bold text-gray-900">Gift Management</h1>
        <button
          onClick={() => navigate("/gifts/upload")}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          <span>Add New Gift</span>
        </button>
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
                placeholder="Search gifts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={fetchGifts}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw size={18} />
              <span>Refresh</span>
            </button>
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
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diamond Value
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGifts.length > 0 ? (
                  filteredGifts.map((gift) => (
                    // <tr key={gift.id} className="hover:bg-gray-50">
                    <tr key={gift.id_barang} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100">
                          <img
                            src={gift.img}
                            // src={
                            //   gift.img
                            //     ? gift.img.startsWith("http")
                            //       ? gift.img
                            //       : `http://${gift.img}`
                            //     : "/placeholder.svg?height=48&width=48"
                            // }
                            alt={gift.nama_barang}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-2">
                            <div className="text-sm font-medium text-gray-900">
                              {gift.nama_barang}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {gift.jumlah}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Diamond size={16} className="text-blue-500 mr-1" />
                          {gift.diamond}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                            onClick={() =>
                              navigate(`/gifts/edit/${gift.id_barang}`)
                            }
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                            // onClick={() => handleDeleteGift(gift.id_barang)}
                            onClick={() => handleDeleteClick(gift)}
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
                      colSpan="5"
                      className="px-6 py-12 text-center text-sm text-gray-500"
                    >
                      <div className="flex flex-col items-center">
                        <Gift className="w-12 h-12 text-gray-300 mb-2" />
                        <p className="text-gray-500 mb-1">No gifts found</p>
                        <p className="text-gray-400 text-xs">
                          Add a new gift or try a different search term
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
            Showing <span className="font-medium">{filteredGifts.length}</span>{" "}
            gifts
          </div>
        </div>
      </div>
      <DeleteGiftModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        gift={giftToDelete}
      />
    </div>
  )
}
