"use client"

import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Book,
  Plus,
  Search,
  RefreshCw,
  ArrowLeft,
  FileText,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
} from "lucide-react"
import RefreshToken from "../../../components/_common_/RefreshToken"
import DeleteSoalModal from "../../../components/MapelPage/DeleteSoalModal"

export default function ListSoal() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [soalList, setSoalList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [moduleDetail, setModuleDetail] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    pilihan_ganda: 0,
  })
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteSoal, setDeleteSoal] = useState(null)

  // Fetch module details
  const fetchModuleDetail = async () => {
    try {
      const response = await fetch(
        `${window.env.VITE_API_URL}/genericModule/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      )

      if (response.ok) {
        const data = await response.json()
        if (data.Data) {
          setModuleDetail(data.Data)
        }
      }
    } catch (err) {
      console.error("Error fetching module details:", err)
    }
  }

  // Fetch soal list
  const fetchSoalList = async () => {
    setLoading(true)
    setError(null)

    try {
      const apiUrl = `${window.env.VITE_API_URL}/genericSoal/${id}`

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          const refreshed = await RefreshToken()
          if (!refreshed) {
            navigate("/login", { replace: true })
            return
          }
        } else {
          throw new Error("Failed to fetch questions")
        }
      }

      const data = await response.json()

      if (data.Message === "Success" && Array.isArray(data.Data)) {
        setSoalList(data.Data)

        // Calculate stats
        const stats = {
          total: data.Data.length,
          pilihan_ganda: data.Data.filter(
            (soal) => soal.jenis === "pilihan_ganda",
          ).length,
        }
        setStats(stats)
      } else if (data.Message === "no data found, maybe wrong in query") {
        setSoalList([])
        setStats({ total: 0, pilihan_ganda: 0 })
      } else {
        setError("Failed to load questions.")
      }
    } catch (err) {
      console.error("Fetch error:", err)
      setError("An error occurred while retrieving the questions.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchModuleDetail()
    fetchSoalList()
  }, [id])

  // Filter soal based on search term
  const filteredSoal = soalList.filter((soal) => {
    const soalText = soal.soal.replace(/<[^>]*>/g, "") // Remove HTML tags for search
    return soalText.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleRowClick = (id_soal) => {
    navigate(`/edit-soal/${id_soal}/${id}`)
  }

  // Function to truncate HTML content for display
  const truncateHtml = (html, maxLength = 100) => {
    const plainText = html.replace(/<[^>]*>/g, "")
    if (plainText.length <= maxLength) return html
    return plainText.substring(0, maxLength) + "..."
  }

  const handleDeleteClick = (e, soal) => {
    e.stopPropagation()
    setDeleteSoal(soal)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteSoal) return

    try {
      const response = await fetch(
        `${window.env.VITE_API_URL}/deleteDataSoal/${deleteSoal.id_soal}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      )

      const data = await response.json()

      if (data.Message && data.Message.includes("Delete soal success")) {
        // Remove from list
        setSoalList((prev) =>
          prev.filter((item) => item.id_soal !== deleteSoal.id_soal),
        )

        // Update stats if needed
        setStats((prev) => ({
          ...prev,
          total: prev.total - 1,
          pilihan_ganda:
            prev.pilihan_ganda - (deleteSoal.jenis === "pilihan_ganda" ? 1 : 0),
        }))
      } else {
        alert("Failed to delete question")
      }
    } catch (err) {
      console.error("Delete error:", err)
      alert("An error occurred while deleting the question")
    } finally {
      setIsDeleteModalOpen(false)
      setDeleteSoal(null)
    }
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header with back button and title */}
      <div className="flex items-center mb-6">
        {/* <button
          onClick={() => navigate(`/list-module/${moduleDetail?.id_mapel || ""}`)}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
          aria-label="Back to modules"
        >
          <ArrowLeft size={20} />
        </button> */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Question List</h1>
          <p className="text-gray-500 text-sm mt-1">
            {moduleDetail
              ? `Module: ${moduleDetail.module_judul}`
              : "Manage questions for this module"}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Questions
              </p>
              <p className="text-3xl font-bold mt-2 text-gray-900">
                {stats.total}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-indigo-100">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Multiple Choice
              </p>
              <p className="text-3xl font-bold mt-2 text-gray-900">
                {stats.pilihan_ganda}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
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
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchSoalList}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw size={18} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={() => navigate(`/upload-soal/${id}`)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Question</span>
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
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Answer
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSoal.length > 0 ? (
                  filteredSoal.map((soal) => (
                    <tr
                      key={soal.id_soal}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleRowClick(soal.id_soal)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {soal.id_soal}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <FileText className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="ml-4 max-w-md">
                            <div
                              className="text-sm text-gray-900 line-clamp-2"
                              dangerouslySetInnerHTML={{
                                __html: truncateHtml(soal.soal),
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            soal.jenis === "pilihan_ganda"
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {soal.jenis === "pilihan_ganda"
                            ? "Multiple Choice"
                            : "Essay"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {soal.jenis === "pilihan_ganda" && (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                            Option {soal.jawaban.toUpperCase()}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div
                          className="flex justify-end space-x-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRowClick(soal.id_soal)
                            }}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRowClick(soal.id_soal)
                            }}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                            onClick={(e) => handleDeleteClick(e, soal)}
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
                        <Book className="w-12 h-12 text-gray-300 mb-2" />
                        <p className="text-gray-500 mb-1">No questions found</p>
                        <p className="text-gray-400 text-xs">
                          Add questions to this module
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
            Showing <span className="font-medium">{filteredSoal.length}</span>{" "}
            questions
          </div>
        </div>
      </div>

      <DeleteSoalModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDeleteSoal(null)
        }}
        onConfirm={handleConfirmDelete}
        soal={deleteSoal}
      />
    </div>
  )
}
