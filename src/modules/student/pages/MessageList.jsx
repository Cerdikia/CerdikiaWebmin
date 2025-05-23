"use client"

import { useState, useEffect } from "react"
import { Search, Mail, MailOpen, Filter, RefreshCw, Eye } from "lucide-react"
import FetchData from "../../../components/_common_/FetchData"
// import { Link } from "react-router-dom"
import { Link, useNavigate } from "react-router-dom"

const MessageList = () => {
  const [messages, setMessages] = useState([])
  const [filteredMessages, setFilteredMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const navigate = useNavigate()
  // const [selectedMessage, setSelectedMessage] = useState(null)
  // const [showModal, setShowModal] = useState(false)

  // Fetch messages from API
  const fetchMessages = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("access_token")
      const response = await FetchData({
        url: `${window.env.VITE_API_URL}/messages`,
        method: "GET",
        token,
      })

      console.log(response)

      if (response && response.Data) {
        setMessages(response.Data)
        setFilteredMessages(response.Data)
      }
    } catch (err) {
      console.error("Error fetching messages:", err)
      setError("Failed to load messages. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  // Update message status to "dibaca" (read)
  // const updateMessageStatus = async (messageId) => {
  //   try {
  //     const token = localStorage.getItem("token")
  //     await FetchData({
  //       url: `${window.env.VITE_API_URL}/api/messages/${messageId}/status`,
  //       method: "PUT",
  //       token,
  //       body: { status: "dibaca" },
  //     })

  //     // Update local state
  //     const updatedMessages = messages.map((msg) =>
  //       msg.id_message === messageId ? { ...msg, status: "dibaca" } : msg,
  //     )
  //     setMessages(updatedMessages)
  //     setFilteredMessages(
  //       updatedMessages.filter((msg) => {
  //         if (statusFilter !== "all" && msg.status !== statusFilter)
  //           return false
  //         return (
  //           msg.dest.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //           msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //           msg.message.toLowerCase().includes(searchTerm.toLowerCase())
  //         )
  //       }),
  //     )
  //   } catch (err) {
  //     console.error("Error updating message status:", err)
  //   }
  // }

  // Open message detail and update status
  // const openMessageDetail = (message) => {
  //   setSelectedMessage(message)
  //   setShowModal(true)

  // Only update status if it's not already "dibaca" (read)
  // if (message.status !== "dibaca") {
  //   updateMessageStatus(message.id_message)
  // }
  // }

  // Filter messages based on search term and status filter
  const filterMessages = () => {
    let filtered = messages

    if (statusFilter !== "all") {
      filtered = filtered.filter((msg) => msg.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (msg) =>
          msg.dest.toLowerCase().includes(searchTerm.toLowerCase()) ||
          msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          msg.message.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredMessages(filtered)
  }

  // Load messages on component mount
  useEffect(() => {
    fetchMessages()
  }, [])

  // Apply filters when search term or status filter changes
  useEffect(() => {
    filterMessages()
  }, [searchTerm, statusFilter, messages])

  // Format date to a readable string
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get status icon based on message status
  const getStatusIcon = (status) => {
    switch (status) {
      case "mengirim":
        return <Mail className="w-5 h-5 text-yellow-500" />
      case "terkirim":
        return <Mail className="w-5 h-5 text-blue-500" />
      case "dibaca":
        return <MailOpen className="w-5 h-5 text-green-500" />
      default:
        return <Mail className="w-5 h-5 text-gray-500" />
    }
  }

  // Handle row click to navigate to message detail
  const handleRowClick = (messageId) => {
    navigate(`/messages/${messageId}`)
  }

  // Get status text in Indonesian
  const getStatusText = (status) => {
    switch (status) {
      case "mengirim":
        return "Mengirim"
      case "terkirim":
        return "Terkirim"
      case "dibaca":
        return "Dibaca"
      default:
        return status
    }
  }

  console.log(filteredMessages)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Pesan</h1>
        <p className="text-gray-600">
          Kelola dan pantau pesan yang dikirim ke pengguna
        </p>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Cari pesan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <select
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="mengirim">Mengirim</option>
              <option value="terkirim">Terkirim</option>
              <option value="dibaca">Dibaca</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          <button
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={fetchMessages}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Messages table */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Penerima
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Subjek
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tanggal
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMessages.length > 0 ? (
                  filteredMessages.map((message) => (
                    <tr
                      key={message.IDMessage}
                      // className={`hover:bg-gray-50 ${message.Status !== "dibaca" ? "font-semibold" : ""}`}
                      className={`hover:bg-gray-50 cursor-pointer ${
                        message.status !== "dibaca"
                          ? "font-semibold bg-blue-50"
                          : ""
                      }`}
                      onClick={() => handleRowClick(message.IDMessage)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(message.Status)}
                          <span className="ml-2 text-sm text-gray-700">
                            {getStatusText(message.Status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {message.Dest}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="max-w-xs truncate">
                          {message.Subject}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(message.CreatedAt)}
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"> */}
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* <button */}
                        <Link
                          to={`/messages/${message.IDMessage}`}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          // onClick={() => openMessageDetail(message)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Lihat
                          {/* </button> */}
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr key="no-messages-row">
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Tidak ada pesan yang ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Message detail modal */}
      {/* {showModal && selectedMessage && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Detail Pesan
                    </h3>

                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500">
                          Status:
                        </span>
                        <div className="flex items-center">
                          {getStatusIcon(selectedMessage.status)}
                          <span className="ml-1 text-sm">
                            {getStatusText(selectedMessage.status)}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500">
                          Dari:
                        </span>
                        <span className="text-sm">
                          {selectedMessage.form || "System"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500">
                          Kepada:
                        </span>
                        <span className="text-sm">{selectedMessage.dest}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500">
                          Tanggal:
                        </span>
                        <span className="text-sm">
                          {formatDate(selectedMessage.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-md font-semibold mb-2">
                        {selectedMessage.subject}
                      </h4>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                        {selectedMessage.message}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowModal(false)}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  )
}

export default MessageList
