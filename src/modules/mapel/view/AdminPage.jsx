"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Book, Plus, Search, RefreshCw, Pencil, Trash2, ChevronDown, MoreHorizontal } from "lucide-react"
import RefreshToken from "../../../components/_common_/RefreshToken"
import MapelModal from "../../../components/MapelPage/MapelModal"
import DeleteMapelModal from "../../../components/MapelPage/DeleteMapelModal"

export default function AdminPage() {
  const navigate = useNavigate()
  const [mapel, setMapel] = useState([])
  const [filteredMapel, setFilteredMapel] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editMapel, setEditMapel] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteMapel, setDeleteMapel] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedKelas, setSelectedKelas] = useState("all")
  const [kelasList, setKelasList] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    byKelas: {},
  })
  const [isAdmin, setIsAdmin] = useState(false)
  const userData = JSON.parse(localStorage.getItem("user_data"))

  useEffect(() => {
    if (userData && userData.role === "admin") {
      setIsAdmin(true)
    } else {
      setIsAdmin(false)
    }
  }, [userData])

  const handleSaveMapel = (mapelData) => {
    console.log("Mata pelajaran baru/update:", mapelData)
    fetchData()
    setIsEditMode(false)
    setEditMapel(null)
  }

  // Fetch kelas data for filtering
  const fetchKelasData = async () => {
    try {
      let response = await fetch(`${import.meta.env.VITE_API_URL}/kelas`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      if (response.status === 401) {
        const refreshed = await RefreshToken()
        if (refreshed) {
          response = await fetch(`${import.meta.env.VITE_API_URL}/kelas`, {
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
      if (data && Array.isArray(data)) {
        setKelasList(data)
      }
    } catch (error) {
      console.error("Error fetching kelas data:", error)
    }
  }

  // Update the fetchData function to use genericAllMapels when "all" is selected
  const fetchData = async () => {
    try {
      // Use genericAllMapels for "all" and genericMapels with id_kelas for specific class
      const url =
        selectedKelas === "all"
          ? `${import.meta.env.VITE_API_URL}/genericAllMapels`
          : `${import.meta.env.VITE_API_URL}/genericMapels?id_kelas=${selectedKelas}`

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

      if (data.Data) {
        // Transform the data to match our component's expected structure
        const transformedData = data.Data.map((item) => ({
          id_mapel: item.id_mapel,
          mapel: item.nama_mapel || item.mapel, // Handle both response formats
          kelas: item.kelas,
          modules_count: item.jumlah_modul,
        }))

        setMapel(transformedData)
        setFilteredMapel(transformedData)

        // Calculate stats
        const statsByKelas = {}

        // Count mapel by kelas
        data.Data.forEach((item) => {
          const kelasId = item.kelas || "uncategorized"

          if (statsByKelas[kelasId]) {
            statsByKelas[kelasId].count++
          } else {
            statsByKelas[kelasId] = {
              name: `Kelas ${kelasId}`,
              count: 1,
            }
          }
        })

        setStats({
          total: data.Data.length,
          byKelas: statsByKelas,
        })
      } else {
        setMapel([])
        setFilteredMapel([])
      }
    } catch (error) {
      console.error("Fetch error:", error)
      setMapel([])
      setFilteredMapel([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKelasData()
    fetchData()
  }, [selectedKelas]) // Refetch when selectedKelas changes

  useEffect(() => {
    // Filter mapel based on search term
    if (searchTerm) {
      const filtered = mapel.filter((item) => item.mapel.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredMapel(filtered)
    } else {
      setFilteredMapel(mapel)
    }
  }, [searchTerm, mapel])

  const handleRowClick = (id) => {
    navigate(`/list-module/${id}`)
  }

  const handleEditClick = (e, row) => {
    e.stopPropagation()
    setEditMapel(row)
    setIsEditMode(true)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (e, mapel) => {
    e.stopPropagation()
    setDeleteMapel(mapel)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteMapel) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/genericMapels/${deleteMapel.id_mapel}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      if (response.ok) {
        // Remove the deleted item from the state
        setMapel(mapel.filter((item) => item.id_mapel !== deleteMapel.id_mapel))
        setFilteredMapel(filteredMapel.filter((item) => item.id_mapel !== deleteMapel.id_mapel))
        alert("Mata pelajaran berhasil dihapus")
      } else {
        alert("Gagal menghapus mata pelajaran")
      }
    } catch (error) {
      console.error("Error deleting mapel:", error)
      alert("Terjadi kesalahan saat menghapus mata pelajaran")
    } finally {
      setIsDeleteModalOpen(false)
      setDeleteMapel(null)
    }
  }

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
      {/* Header with title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mata Pelajaran</h1>
        <p className="text-gray-500">Kelola semua mata pelajaran dan modul pembelajaran</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 cursor-pointer ${selectedKelas === "all" ? "ring-2 ring-indigo-500" : ""}`}
          onClick={() => setSelectedKelas("all")}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Semua Mata Pelajaran</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">{stats.total}</p>
            </div>
            <div className={`p-3 rounded-lg ${selectedKelas === "all" ? "bg-indigo-500" : "bg-indigo-100"}`}>
              <Book className={`w-6 h-6 ${selectedKelas === "all" ? "text-white" : "text-indigo-600"}`} />
            </div>
          </div>
        </div>

        {/* Kelas filter cards - show top 3 classes */}
        {Object.entries(stats.byKelas)
          .slice(0, 3)
          .map(([kelasId, kelasData]) => (
            <div
              key={kelasId}
              className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 cursor-pointer ${selectedKelas === kelasId.toString() ? "ring-2 ring-indigo-500" : ""}`}
              onClick={() => setSelectedKelas(kelasId.toString())}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{kelasData.name}</p>
                  <p className="text-3xl font-bold mt-2 text-gray-900">{kelasData.count}</p>
                </div>
                <div
                  className={`p-3 rounded-lg ${selectedKelas === kelasId.toString() ? "bg-indigo-500" : "bg-indigo-100"}`}
                >
                  <Book
                    className={`w-6 h-6 ${selectedKelas === kelasId.toString() ? "text-white" : "text-indigo-600"}`}
                  />
                </div>
              </div>
            </div>
          ))}
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
                placeholder="Cari mata pelajaran..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <div className="relative inline-block">
                <select
                  value={selectedKelas}
                  onChange={(e) => setSelectedKelas(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Semua Kelas</option>
                  {kelasList.map((kelas) => (
                    <option key={kelas.id_kelas} value={kelas.id_kelas.toString()}>
                      {kelas.kelas}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={16}
                />
              </div>

              <button
                onClick={() => fetchData()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw size={18} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={() => {
                  setIsEditMode(false)
                  setEditMapel(null)
                  setIsModalOpen(true)
                }}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Tambah Mapel</span>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mata Pelajaran
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kelas
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMapel.length > 0 ? (
                  filteredMapel.map((row, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleRowClick(row.id_mapel)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.id_mapel}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <Book className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{row.mapel}</div>
                            <div className="text-sm text-gray-500">{row.modules_count || 0} modul</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {row.kelas ? `Kelas ${row.kelas}` : "Semua Kelas"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                            onClick={(e) => handleEditClick(e, row)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                            onClick={(e) => handleDeleteClick(e, row)}
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="relative inline-block">
                            <button
                              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal size={16} />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center">
                        <Book className="w-12 h-12 text-gray-300 mb-2" />
                        <p className="text-gray-500 mb-1">Tidak ada mata pelajaran ditemukan</p>
                        <p className="text-gray-400 text-xs">Coba ubah filter atau tambahkan mata pelajaran baru</p>
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
            Menampilkan <span className="font-medium">{filteredMapel.length}</span> dari{" "}
            <span className="font-medium">{mapel.length}</span> mata pelajaran
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              Sebelumnya
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      <MapelModal
        endpoint={isEditMode ? `genericMapels/${editMapel?.id_mapel}` : "genericMapels"}
        method={isEditMode ? "PUT" : "POST"}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setIsEditMode(false)
          setEditMapel(null)
        }}
        onSave={handleSaveMapel}
        fields={["mapel"]}
        editData={editMapel}
        kelasList={kelasList}
      />

      <DeleteMapelModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDeleteMapel(null)
        }}
        onConfirm={handleConfirmDelete}
        mapel={deleteMapel}
      />
    </div>
  )
}
