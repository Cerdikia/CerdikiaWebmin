"use client"

// import { useState, useEffect } from "react"
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Calendar,
  ChevronDown,
  Download,
  FileText,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Edit,
  AlertCircle,
  X,
  Check,
  Info,
} from "lucide-react"
import FetchData from "../../../components/_common_/FetchData"
import * as XLSX from "xlsx"

export default function SemesterRecap() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [recapData, setRecapData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    tahun_ajaran: "",
    semester: "",
    id_kelas: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [classes, setClasses] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedData, setSelectedData] = useState(null)
  const [createForm, setCreateForm] = useState({
    tahun_ajaran: "",
    semester: "Ganjil",
    delete_logs_data: false,
    filter_kelas: "",
    filter_mapel: "",
    start_date: "",
    end_date: "",
  })
  const [editForm, setEditForm] = useState({
    tahun_ajaran_lama: "",
    tahun_ajaran_baru: "",
    semester: "",
  })
  const [subjects, setSubjects] = useState([])
  const [notification, setNotification] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [expandedRows, setExpandedRows] = useState({})

  // Fetch initial data
  useEffect(() => {
    // console.log(localStorage.getItem("access_token"))

    fetchRecapData()
    fetchClasses()
    fetchSubjects()
  }, [])

  // Apply filters and search
  useEffect(() => {
    let filtered = [...recapData]

    // Apply filters
    if (filters.tahun_ajaran) {
      filtered = filtered.filter(
        (item) => item.tahun_ajaran === filters.tahun_ajaran,
      )
    }
    if (filters.semester) {
      filtered = filtered.filter((item) => item.semester === filters.semester)
    }
    if (filters.id_kelas) {
      filtered = filtered.filter(
        (item) => item.id_kelas === Number.parseInt(filters.id_kelas),
      )
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.email.toLowerCase().includes(term) ||
          (item.nama_siswa && item.nama_siswa.toLowerCase().includes(term)) ||
          (item.kelas && item.kelas.toLowerCase().includes(term)),
      )
    }

    setFilteredData(filtered)
  }, [recapData, filters, searchTerm])

  const fetchRecapData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("access_token")
      const response = await FetchData({
        url: `${window.env.VITE_API_URL}/rekap-semester-all`,
        method: "GET",
        token,
      })

      if (response && response.data) {
        // console.log("rekap-semester-all", response.data[0].tahun_ajaran)
        setRecapData(response.data)
        setFilteredData(response.data)
      }
    } catch (error) {
      console.error("Error fetching recap data:", error)
      showNotification("Error fetching recap data", "error")
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    // console.log("runing fetch class")

    try {
      const token = localStorage.getItem("access_token")
      const response = await FetchData({
        url: `${window.env.VITE_API_URL}/kelas`,
        method: "GET",
        token,
      })

      if (response) {
        // console.log(response)
        setClasses(response)
      }
    } catch (error) {
      console.error("Error fetching classes:", error)
    }
  }

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem("access_token")
      const response = await FetchData({
        url: `${window.env.VITE_API_URL}/genericAllMapels`,
        method: "GET",
        token,
      })

      if (response && response.Data) {
        setSubjects(response.Data)
      }
    } catch (error) {
      console.error("Error fetching subjects:", error)
    }
  }

  const handleCreateRecap = async () => {
    setIsProcessing(true)
    try {
      // Validate form
      // if (!createForm.tahun_ajaran || !createForm.semester) {
      //   showNotification("Tahun ajaran dan semester harus diisi", "error")
      if (!createForm.tahun_ajaran) {
        showNotification("Tahun ajaran harus diisi", "error")
        setIsProcessing(false)
        return
      }

      // Validate tahun ajaran format (YYYY/YYYY)
      const tahunAjaranRegex = /^\d{4}\/\d{4}$/
      if (!tahunAjaranRegex.test(createForm.tahun_ajaran)) {
        showNotification("Format tahun ajaran harus YYYY/YYYY", "error")
        setIsProcessing(false)
        return
      }

      // Validate tahun ajaran logic (second year should be first year + 1)
      const [firstYear, secondYear] = createForm.tahun_ajaran
        .split("/")
        .map(Number)
      if (secondYear !== firstYear + 1) {
        showNotification("Tahun kedua harus tahun pertama + 1", "error")
        setIsProcessing(false)
        return
      }

      const token = localStorage.getItem("access_token")

      // Prepare request body based on the new API
      const requestBody = {
        tahun_ajaran: createForm.tahun_ajaran,
        delete_logs_data: createForm.delete_logs_data,
        semester: createForm.semester,
        // created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
        created_at: new Date().toISOString(),
      }

      // Add optional parameters if they exist
      if (createForm.start_date) requestBody.start_date = createForm.start_date
      if (createForm.end_date) requestBody.end_date = createForm.end_date

      // Use the appropriate endpoint based on whether we're creating for all students or specific ones
      const endpoint =
        createForm.filter_kelas || createForm.filter_mapel
          ? "/rekap-semester"
          : "/rekap-semester-all-siswa"

      // Add filter parameters if needed
      if (createForm.filter_kelas)
        requestBody.id_kelas = createForm.filter_kelas
      if (createForm.filter_mapel)
        requestBody.id_mapel = createForm.filter_mapel

      // console.log("request body : ", requestBody)

      const response = await FetchData({
        // url: `${window.env.VITE_API_URL}/rekap-semester`,
        url: `${window.env.VITE_API_URL}${endpoint}`,
        method: "POST",
        token,
        // body: createForm,
        body: requestBody,
      })

      if (response) {
        const successMessage =
          endpoint === "/rekap-semester-all-siswa"
            ? `Rekap semester untuk semua siswa berhasil dibuat. Total ${response.total_logs_processed || 0} data diproses.`
            : `Rekap semester berhasil dibuat. ${response.data?.length || 0} data berhasil direkap.`

        showNotification(successMessage, "success")
        setShowCreateModal(false)
        fetchRecapData()
      }
    } catch (error) {
      console.error("Error creating recap:", error)
      // showNotification("Error creating recap", "error")
      showNotification(
        "Error creating recap: " + (error.message || "Unknown error"),
        "error",
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEditTahunAjaran = async () => {
    setIsProcessing(true)
    try {
      // Validate form
      if (!editForm.tahun_ajaran_lama || !editForm.tahun_ajaran_baru) {
        showNotification("Tahun ajaran lama dan baru harus diisi", "error")
        setIsProcessing(false)
        return
      }

      // Validate tahun ajaran format (YYYY/YYYY)
      const tahunAjaranRegex = /^\d{4}\/\d{4}$/
      if (!tahunAjaranRegex.test(editForm.tahun_ajaran_baru)) {
        showNotification("Format tahun ajaran harus YYYY/YYYY", "error")
        setIsProcessing(false)
        return
      }

      // Validate tahun ajaran logic (second year should be first year + 1)
      const [firstYear, secondYear] = editForm.tahun_ajaran_baru
        .split("/")
        .map(Number)
      if (secondYear !== firstYear + 1) {
        showNotification("Tahun kedua harus tahun pertama + 1", "error")
        setIsProcessing(false)
        return
      }

      const token = localStorage.getItem("access_token")
      const response = await FetchData({
        url: `${window.env.VITE_API_URL}/edit-tahun-ajaran`,
        method: "POST",
        token,
        body: editForm,
      })

      if (response) {
        // showNotification(
        //   `Tahun ajaran berhasil diperbarui. ${response.rows_affected} data terpengaruh.`,
        //   "success",
        // )
        showNotification(
          `Tahun ajaran berhasil diperbarui. ${response.records_updated || 0} data terpengaruh.`,
          "success",
        )
        setShowEditModal(false)
        fetchRecapData()
      }
    } catch (error) {
      console.error("Error editing tahun ajaran:", error)
      // showNotification("Error editing tahun ajaran", "error")
      showNotification(
        "Error editing tahun ajaran: " + (error.message || "Unknown error"),
        "error",
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteRecap = async () => {
    if (!selectedData) return

    setIsProcessing(true)
    try {
      const token = localStorage.getItem("access_token")
      const response = await FetchData({
        url: `${window.env.VITE_API_URL}/rekap-semester/${selectedData.id_data}`,
        method: "DELETE",
        token,
      })

      if (response) {
        showNotification("Data rekap semester berhasil dihapus", "success")
        setShowDeleteModal(false)
        fetchRecapData()
      }
    } catch (error) {
      console.error("Error deleting recap:", error)
      // showNotification("Error deleting recap", "error")
      showNotification(
        "Error deleting recap: " + (error.message || "Unknown error"),
        "error",
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const exportToExcel = () => {
    // Prepare data for export
    const exportData = filteredData.map((item) => {
      // Count the number of modules per subject
      const modulesBySubject = {}
      if (item.progres && Array.isArray(item.progres)) {
        item.progres.forEach((prog) => {
          if (!modulesBySubject[prog.id_mapel]) {
            modulesBySubject[prog.id_mapel] = 0
          }
          modulesBySubject[prog.id_mapel]++
        })
      }

      // Calculate average score per subject
      const scoresBySubject = {}
      if (item.progres && Array.isArray(item.progres)) {
        item.progres.forEach((prog) => {
          if (!scoresBySubject[prog.id_mapel]) {
            scoresBySubject[prog.id_mapel] = {
              total: 0,
              count: 0,
            }
          }
          scoresBySubject[prog.id_mapel].total += prog.skor
          scoresBySubject[prog.id_mapel].count++
        })
      }

      // Format the data
      const subjectData = {}
      subjects.forEach((subject) => {
        const avgScore =
          scoresBySubject[subject.id_mapel] &&
          scoresBySubject[subject.id_mapel].count > 0
            ? (
                scoresBySubject[subject.id_mapel].total /
                scoresBySubject[subject.id_mapel].count
              ).toFixed(2)
            : "-"
        const moduleCount = modulesBySubject[subject.id_mapel] || 0
        subjectData[`${subject.mapel} (Avg)`] = avgScore
        subjectData[`${subject.mapel} (Modules)`] = moduleCount
      })

      return {
        Email: item.email,
        "Nama Siswa": item.nama_siswa || "-",
        Kelas: item.kelas || "-",
        "Tahun Ajaran": item.tahun_ajaran,
        Semester: item.semester,
        "Tanggal Rekap": new Date(item.created_at).toLocaleDateString("id-ID"),
        ...subjectData,
      }
    })

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData)

    // Create workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Semester")

    // Generate filename
    let filename = "Rekap_Semester"
    if (filters.tahun_ajaran)
      filename += `_${filters.tahun_ajaran.replace("/", "-")}`
    if (filters.semester) filename += `_${filters.semester}`
    if (filters.id_kelas) {
      const kelas = classes.find(
        (c) => c.id_kelas === Number.parseInt(filters.id_kelas),
      )
      if (kelas) filename += `_${kelas.nama_kelas}`
    }
    filename += ".xlsx"

    // Save file
    XLSX.writeFile(wb, filename)
  }

  const toggleRowExpand = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const showNotification = (message, type = "info") => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  const resetCreateForm = () => {
    setCreateForm({
      tahun_ajaran: "",
      // semester: "Ganjil",
      delete_logs_data: false,
      filter_kelas: "",
      filter_mapel: "",
      start_date: "",
      end_date: "",
    })
  }

  const resetEditForm = () => {
    setEditForm({
      tahun_ajaran_lama: "",
      tahun_ajaran_baru: "",
      semester: "",
    })
  }

  const getUniqueValues = (field) => {
    const values = [...new Set(recapData.map((item) => item[field]))]
    return values.filter(Boolean).sort()
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const getSubjectName = (id) => {
    const subject = subjects.find((s) => s.id_mapel === id)
    return subject ? subject.mapel : `Mapel ID ${id}`
  }

  return (
    <div className="">
      {/* {console.log(classes)} */}
      <div className="container px-4 py-6 mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Rekap Semester</h1>
          <p className="text-gray-600">Kelola rekap semester untuk siswa</p>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`mb-4 p-4 rounded-lg flex items-start justify-between ${
              notification.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : notification.type === "error"
                  ? "bg-red-50 text-red-800 border border-red-200"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
            }`}
          >
            <div className="flex items-center">
              {notification.type === "success" ? (
                <Check className="w-5 h-5 mr-2 flex-shrink-0" />
              ) : notification.type === "error" ? (
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              ) : (
                <Info className="w-5 h-5 mr-2 flex-shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                resetCreateForm()
                setShowCreateModal(true)
              }}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Buat Rekap Semester
            </button>
            <button
              onClick={() => {
                resetEditForm()
                setShowEditModal(true)
              }}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Tahun Ajaran
            </button>
            <button
              onClick={exportToExcel}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={filteredData.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </button>
            <button
              onClick={fetchRecapData}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Cari siswa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
              <ChevronDown
                className={`w-4 h-4 ml-1 transition-transform ${showFilters ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Filters */}
        {/* {console.log("kondisi 1", classes)} */}
        {showFilters && (
          <div className="p-4 mb-6 bg-gray-50 border border-gray-200 rounded-lg">
            {/* {console.log("kondisi 2", classes)} */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label
                  htmlFor="tahun_ajaran"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Tahun Ajaran
                </label>
                <select
                  id="tahun_ajaran"
                  value={filters.tahun_ajaran}
                  onChange={(e) =>
                    setFilters({ ...filters, tahun_ajaran: e.target.value })
                  }
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Semua Tahun Ajaran</option>
                  {getUniqueValues("tahun_ajaran").map((tahun) => (
                    <option key={tahun} value={tahun}>
                      {tahun}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="id_kelas"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Kelas
                </label>
                {/* {console.log(classes)} */}
                <select
                  id="id_kelas"
                  value={filters.id_kelas}
                  onChange={(e) =>
                    setFilters({ ...filters, id_kelas: e.target.value })
                  }
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Semua Kelas</option>
                  {/* {console.log(classes)} */}
                  {classes.map((kelas) => (
                    <option key={kelas.id_kelas} value={kelas.id_kelas}>
                      {kelas.kelas}
                      {/* {console.log("kelas", kelas.kelas)} */}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() =>
                  setFilters({ tahun_ajaran: "", semester: "", id_kelas: "" })
                }
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Reset Filter
              </button>
            </div>
          </div>
        )}

        {/* Data table */}
        <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Siswa
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Kelas
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Tahun Ajaran
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Semester
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Tanggal Rekap
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Jumlah Progres
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase"
                  >
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Tidak ada data rekap semester
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    // <>
                    //   <tr key={item.id_data} className="hover:bg-gray-50">
                    <React.Fragment key={item.id_data}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.nama_siswa || "-"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {item.kelas || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {item.tahun_ajaran}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {/* <span className="bg-red-400">{item.semester}</span> */}
                          <span
                            className={`px-2 py-1 rounded text-white text-xs font-medium ${
                              item.semester === "ganjil"
                                ? "bg-green-500"
                                : "bg-blue-500"
                            }`}
                          >
                            {item.semester}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {formatDate(item.created_at)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {item.progres && Array.isArray(item.progres)
                            ? item.progres.length
                            : 0}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => toggleRowExpand(item.id_data)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <span className="sr-only">Detail</span>
                              <FileText className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedData(item)
                                setShowDeleteModal(true)
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <span className="sr-only">Delete</span>
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedRows[item.id_data] && (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 bg-gray-50">
                            <div className="text-sm text-gray-900">
                              <h4 className="mb-2 font-medium">
                                Detail Progres:
                              </h4>
                              {item.progres &&
                              Array.isArray(item.progres) &&
                              item.progres.length > 0 ? (
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="px-4 py-2 text-xs font-medium text-left text-gray-500">
                                          Mata Pelajaran
                                        </th>
                                        <th className="px-4 py-2 text-xs font-medium text-left text-gray-500">
                                          Module
                                        </th>
                                        <th className="px-4 py-2 text-xs font-medium text-left text-gray-500">
                                          Skor
                                        </th>
                                        <th className="px-4 py-2 text-xs font-medium text-left text-gray-500">
                                          Tanggal
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {item.progres.map((prog, idx) => (
                                        <tr
                                          key={idx}
                                          className="hover:bg-gray-50"
                                        >
                                          <td className="px-4 py-2 text-xs text-gray-900">
                                            {getSubjectName(prog.id_mapel)}
                                          </td>
                                          <td className="px-4 py-2 text-xs text-gray-900">
                                            {prog.id_module}
                                          </td>
                                          <td className="px-4 py-2 text-xs text-gray-900">
                                            {prog.skor}
                                          </td>
                                          <td className="px-4 py-2 text-xs text-gray-900">
                                            {formatDate(prog.created_at)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <p className="text-gray-500">
                                  Tidak ada data progres
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                      {/* </> */}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Recap Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl p-6 mx-4 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Buat Rekap Semester
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-500"
                disabled={isProcessing}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="tahun_ajaran"
                    className="block mb-1 text-sm font-medium text-gray-700"
                  >
                    Tahun Ajaran <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="tahun_ajaran"
                    placeholder="contoh: 2024/2025"
                    value={createForm.tahun_ajaran}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        tahun_ajaran: e.target.value,
                      })
                    }
                    className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Format: YYYY/YYYY (contoh: 2024/2025)
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="semester"
                    className="block mb-1 text-sm font-medium text-gray-700"
                  >
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="semester"
                    value={createForm.semester}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, semester: e.target.value })
                    }
                    className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="Ganjil">Ganjil</option>
                    <option value="Genap">Genap</option>
                  </select>
                </div>
              </div>

              {/* FILTER KELAS */}
              {/* <div>
                <label
                  htmlFor="filter_kelas"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Filter Kelas (Opsional)
                </label>
                <select
                  id="filter_kelas"
                  value={createForm.filter_kelas}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      filter_kelas: e.target.value,
                    })
                  }
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Semua Kelas</option>
                  {classes.map((kelas) => (
                    <option key={kelas.id_kelas} value={kelas.id_kelas}>
                      {kelas.kelas}
                    </option>
                  ))}
                </select>
              </div> */}

              {/* FILTER MATA PELAJARAN */}
              {/* <div>
                <label
                  htmlFor="filter_mapel"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Filter Mata Pelajaran (Opsional)
                </label>
                <select
                  id="filter_mapel"
                  value={createForm.filter_mapel}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      filter_mapel: e.target.value,
                    })
                  }
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Semua Mata Pelajaran</option>
                  {subjects.map((subject) => (
                    <option key={subject.id_mapel} value={subject.id_mapel}>
                      {subject.mapel}
                    </option>
                  ))}
                </select>
              </div> */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="start_date"
                    className="block mb-1 text-sm font-medium text-gray-700"
                  >
                    Tanggal Mulai (Opsional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Calendar className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="start_date"
                      value={createForm.start_date}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          start_date: e.target.value,
                        })
                      }
                      className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="end_date"
                    className="block mb-1 text-sm font-medium text-gray-700"
                  >
                    Tanggal Akhir (Opsional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Calendar className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="end_date"
                      value={createForm.end_date}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          end_date: e.target.value,
                        })
                      }
                      className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="delete_logs_data"
                  checked={createForm.delete_logs_data}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      delete_logs_data: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label
                  htmlFor="delete_logs_data"
                  className="block ml-2 text-sm text-gray-700"
                >
                  Hapus data logs setelah rekap
                </label>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Perhatian
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Proses rekap semester akan mengarsipkan data dari tabel
                        logs ke tabel data_siswa. Pastikan data yang akan
                        direkap sudah benar.
                      </p>
                      <p className="mt-1">
                        Jika opsi "Hapus data logs setelah rekap" dicentang,
                        data logs yang sudah direkap akan dihapus secara
                        permanen.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isProcessing}
              >
                Batal
              </button>
              <button
                onClick={handleCreateRecap}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isProcessing}
              >
                {isProcessing ? "Memproses..." : "Buat Rekap"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Tahun Ajaran Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Edit Tahun Ajaran
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-500"
                disabled={isProcessing}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="tahun_ajaran_lama"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Tahun Ajaran Lama <span className="text-red-500">*</span>
                </label>
                <select
                  id="tahun_ajaran_lama"
                  value={editForm.tahun_ajaran_lama}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      tahun_ajaran_lama: e.target.value,
                    })
                  }
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Pilih Tahun Ajaran</option>
                  {getUniqueValues("tahun_ajaran").map((tahun) => (
                    <option key={tahun} value={tahun}>
                      {tahun}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="tahun_ajaran_baru"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Tahun Ajaran Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="tahun_ajaran_baru"
                  placeholder="contoh: 2025/2026"
                  value={editForm.tahun_ajaran_baru}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      tahun_ajaran_baru: e.target.value,
                    })
                  }
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Format: YYYY/YYYY (contoh: 2025/2026)
                </p>
              </div>
              <div>
                <label
                  htmlFor="edit_semester"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Semester
                </label>
                <select
                  id="edit_semester"
                  value={editForm.semester}
                  onChange={(e) =>
                    setEditForm({ ...editForm, semester: e.target.value })
                  }
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Semua Semester</option>
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Kosongkan untuk mengubah semua semester pada tahun ajaran yang
                  dipilih
                </p>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Perhatian
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Proses ini akan mengubah tahun ajaran pada data rekap
                        semester yang sudah ada. Pastikan data yang akan diubah
                        sudah benar.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isProcessing}
              >
                Batal
              </button>
              <button
                onClick={handleEditTahunAjaran}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isProcessing}
              >
                {isProcessing ? "Memproses..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Konfirmasi Hapus
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-500"
                disabled={isProcessing}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Apakah Anda yakin ingin menghapus data rekap semester untuk
                siswa{" "}
                <span className="font-medium text-gray-900">
                  {selectedData.nama_siswa || selectedData.email}
                </span>{" "}
                pada tahun ajaran{" "}
                <span className="font-medium text-gray-900">
                  {selectedData.tahun_ajaran} ({selectedData.semester})
                </span>
                ?
              </p>
              <p className="mt-2 text-sm text-red-500">
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isProcessing}
              >
                Batal
              </button>
              <button
                onClick={handleDeleteRecap}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={isProcessing}
              >
                {isProcessing ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
