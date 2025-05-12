"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Mail, MailOpen, Clock, User, Users } from "lucide-react"
import FetchData from "../../../components/_common_/FetchData"

const MessageDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch message by ID
  const fetchMessage = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("access_token")
      const response = await FetchData({
        url: `${import.meta.env.VITE_API_URL}/messages/${id}`,
        method: "GET",
        token,
      })

      if (response && response.Data) {
        setMessage(response.Data)

        // If message status is not "dibaca", update it
        // if (response.data.status !== "dibaca") {
        //   updateMessageStatus(response.data.id_message)
        // }
      }
    } catch (err) {
      console.error("Error fetching message:", err)
      setError(
        "Failed to load message. The message may not exist or you don't have permission to view it.",
      )
    } finally {
      setLoading(false)
    }
  }

  // Update message status to "dibaca" (read)
  // const updateMessageStatus = async (messageId) => {
  //   try {
  //     const token = localStorage.getItem("token")
  //     await FetchData({
  //       url: `${import.meta.env.VITE_API_URL}/api/messages/${messageId}/status`,
  //       method: "PUT",
  //       token,
  //       body: { status: "dibaca" },
  //     })

  //     // Update local state
  //     setMessage((prev) => (prev ? { ...prev, status: "dibaca" } : prev))
  //   } catch (err) {
  //     console.error("Error updating message status:", err)
  //   }
  // }

  // Load message on component mount
  useEffect(() => {
    fetchMessage()
  }, [id])

  // Format date to a readable string
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get status icon and color based on message status
  const getStatusInfo = (status) => {
    switch (status) {
      case "mengirim":
        return {
          icon: <Mail className="w-5 h-5" />,
          color: "text-yellow-500 bg-yellow-50",
          text: "Mengirim",
        }
      case "terkirim":
        return {
          icon: <Mail className="w-5 h-5" />,
          color: "text-blue-500 bg-blue-50",
          text: "Terkirim",
        }
      case "dibaca":
        return {
          icon: <MailOpen className="w-5 h-5" />,
          color: "text-green-500 bg-green-50",
          text: "Dibaca",
        }
      default:
        return {
          icon: <Mail className="w-5 h-5" />,
          color: "text-gray-500 bg-gray-50",
          text: status,
        }
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate("/messages")}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Kembali ke Daftar Pesan
      </button>

      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center text-red-500 py-8">
            <div className="text-5xl mb-4">😕</div>
            <h3 className="text-lg font-medium mb-2">Pesan Tidak Ditemukan</h3>
            <p>{error}</p>
          </div>
        </div>
      ) : message ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Message header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-start">
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                {message.subject}
              </h1>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusInfo(message.Status).color}`}
              >
                <div className="flex items-center">
                  {getStatusInfo(message.Status).icon}
                  <span className="ml-1">
                    {getStatusInfo(message.Status).text}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Message metadata */}
          <div className="bg-gray-50 px-6 py-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <User className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-500 mr-1">Dari:</span>
                <span className="text-sm font-medium">
                  {message.Form || "System"}
                </span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-500 mr-1">Kepada:</span>
                <span className="text-sm font-medium">{message.Dest}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-500 mr-1">Dikirim:</span>
                <span className="text-sm">{formatDate(message.CreatedAt)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-500 mr-1">Diperbarui:</span>
                <span className="text-sm">{formatDate(message.UpdatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Message content */}
          <div className="px-6 py-6">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap">{message.Message}</div>
            </div>
          </div>

          {/* Message actions */}
          <div className="bg-gray-50 px-6 py-3 flex justify-between items-center border-t border-gray-200">
            <div className="text-sm text-gray-500">
              ID Pesan: <span className="font-mono">{message.IDMessage}</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => navigate("/messages")}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default MessageDetail
