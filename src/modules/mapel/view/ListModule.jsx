"use client"

import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Book,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  ArrowLeft,
  FileText,
} from "lucide-react"
import RefreshToken from "../../../components/_common_/RefreshToken"
import FetchData from "../../../components/_common_/FetchData"
import ModuleModal from "../../../components/ModulePage/ModuleModal"
import DeleteModuleModal from "../../../components/ModulePage/DeleteModuleModal"

export default function ListModule() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editModule, setEditModule] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteModule, setDeleteModule] = useState(null)
  const [kelasList, setKelasList] = useState([])
  const [mapelDetail, setMapelDetail] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const userData = JSON.parse(localStorage.getItem("user_data"))
  const [isAdmin, setIsAdmin] = useState(false)

  // Store mapel ID in localStorage
  useEffect(() => {
    if (id) {
      localStorage.setItem("idMapel", id)
    }
  }, [id])

  const storedId = localStorage.getItem("idMapel") || id

  useEffect(() => {
    setIsAdmin(userData?.role === "admin")
  }, [userData])

  const handleSaveModule = (moduleData) => {
    console.log("Module baru/update:", moduleData)
    fetchData()
    setIsEditMode(false)
    setEditModule(null)
  }

  const getKelas = async () => {
    try {
      const data = await FetchData({
        url: `${import.meta.env.VITE_API_URL}/kelas`,
        token: localStorage.getItem("access_token"),
      })
      setKelasList(data)
    } catch (err) {
      console.error("Gagal mengambil data kelas:", err)
    }
  }

  const getMataPelajaran = async (id_mapel) => {
    try {
      const data = await FetchData({
        url: `${import.meta.env.VITE_API_URL}/genericMapel/${id_mapel}`,
        token: localStorage.getItem("access_token"),
      })

      setMapelDetail({
        title: "Mata Pelajaran",
        text: data.Data.mapel,
        value: data.Data.id_mapel,
      })
    } catch (err) {
      console.error("Gagal mengambil data mata pelajaran:", err)
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      let response = await fetch(
        `${import.meta.env.VITE_API_URL}/genericModules?id_mapel=${storedId}`,
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
            `${import.meta.env.VITE_API_URL}/genericModules?id_mapel=${storedId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              },
            },
          )
        } else {
          window.location.href = "/login"
          return
        }
      }

      const data = await response.json()

      if (data.Data) {
        setModules(data.Data)
      } else {
        setModules([])
      }
    } catch (error) {
      console.error("Fetch error:", error)
      setModules([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getMataPelajaran(storedId)
    getKelas()
    fetchData()
  }, [storedId])

  // Filter modules based on search term
  const filteredModules = modules.filter((module) => {
    return (
      module.module_judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.module_deskripsi?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleRowClick = (id) => {
    navigate(`/list-soal/${id}`)
  }

  const handleEditClick = (e, module) => {
    e.stopPropagation()
    setEditModule(module)
    setIsEditMode(true)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (e, module) => {
    e.stopPropagation()
    setDeleteModule(module)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteModule) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/genericModules/${deleteModule.id_module}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      if (response.ok) {
        // Remove the deleted item from the state
        setModules(modules.filter((module) => module.id_module !== deleteModule.id_module))
        alert("Modul berhasil dihapus")
      } else {
        alert("Gagal menghapus modul")
      }
    } catch (error) {
      console.error("Error deleting module:", error)
      alert("Terjadi kesalahan saat menghapus modul")
    } finally {
      setIsDeleteModalOpen(false)
      setDeleteModule(null)
    }
  }

  // Check if user is admin
  if (!isAdmin) {
    return (
      <div className="p-8 bg-red-50 rounded-xl border border-red-200">
        <h2 className="text-xl font-semibold text-red-700">Akses Ditolak</h2>
        <p className="mt-2 text-red-600">Halaman ini hanya untuk Admin.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header with back button and title */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/admin-mapel")}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
          aria-label="Back to subjects"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Modul</h1>
          <p className="text-gray-500 text-sm mt-1">
            {mapelDetail.text
              ? `Mata Pelajaran: ${mapelDetail.text}`
              : "Kelola modul pembelajaran"}
          </p>
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
                placeholder="Cari modul..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw size={18} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={() => {
                  setIsEditMode(false)
                  setEditModule(null)
                  setIsModalOpen(true)
                }}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Tambah Modul</span>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kelas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Modul
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nomor Modul
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Judul
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deskripsi
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredModules.length > 0 ? (
                  filteredModules.map((module) => (
                    <tr
                      key={module.id_module}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleRowClick(module.id_module)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {module.kelas}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {module.id_module}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {module.module}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <FileText className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {module.module_judul}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {module.module_deskripsi}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div
                          className="flex justify-end space-x-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                            onClick={(e) => handleEditClick(e, module)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                            
                            onClick={(e) => handleDeleteClick(e, module)}
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
                        <Book className="w-12 h-12 text-gray-300 mb-2" />
                        <p className="text-gray-500 mb-1">
                          Tidak ada modul ditemukan
                        </p>
                        <p className="text-gray-400 text-xs">
                          Tambahkan modul baru untuk mata pelajaran ini
                        </p>
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
            Menampilkan{" "}
            <span className="font-medium">{filteredModules.length}</span> modul
          </div>
        </div>
      </div>

      <ModuleModal
        endpoint={
          isEditMode
            ? `genericModules/${editModule?.id_module}`
            : "genericModules"
        }
        method={isEditMode ? "PUT" : "POST"}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setIsEditMode(false)
          setEditModule(null)
        }}
        onSave={handleSaveModule}
        kelasOptions={kelasList}
        fields={[
          "id_kelas",
          "id_mapel",
          "module",
          "module_judul",
          "module_deskripsi",
        ]}
        detailData={mapelDetail}
        editData={editModule}
      />

      <DeleteModuleModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDeleteModule(null)
        }}
        onConfirm={handleConfirmDelete}
        module={deleteModule}
      />
    </div>
  )
}
