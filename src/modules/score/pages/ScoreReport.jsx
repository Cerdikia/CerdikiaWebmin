"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Download, Filter, Search, RefreshCw } from "lucide-react"
import FetchData from "../../../components/_common_/FetchData"
import FetchAllKelas from "../../../components/_common_/FetchAllKelas"
import * as XLSX from "xlsx"

export default function ScoreReport() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [students, setStudents] = useState([])
  const [summary, setSummary] = useState(null)
  const [kelas, setKelas] = useState([])
  const [mapel, setMapel] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    id_kelas: "",
    id_mapel: "",
    aggregate_by: "highest",
  })

  // Fetch kelas data
  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const token = localStorage.getItem("access_token")
        const response = await FetchData({
          url: `${import.meta.env.VITE_API_URL}/kelas`,
          method: "GET",
          token,
        })

        // console.log(response)

        if (response) {
          setKelas(response)
        }
      } catch (error) {
        console.error("Error fetching mapel:", error)
      }
    }

    fetchKelas()
  }, [])

  // Fetch mapel data
  useEffect(() => {
    const fetchMapel = async () => {
      try {
        const token = localStorage.getItem("access_token")
        const response = await FetchData({
          url: `${import.meta.env.VITE_API_URL}/genericAllMapels`,
          method: "GET",
          token,
        })

        if (response && response.Data) {
          setMapel(response.Data)
        }
      } catch (error) {
        console.error("Error fetching mapel:", error)
      }
    }

    fetchMapel()
  }, [])

  // Fetch student report data
  const fetchStudentReport = async () => {
    if (!filters.id_kelas && !filters.id_mapel) {
      alert("Pilih minimal kelas atau mata pelajaran")
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("access_token")
      const queryParams = new URLSearchParams()

      if (filters.id_kelas) queryParams.append("id_kelas", filters.id_kelas)
      if (filters.id_mapel) queryParams.append("id_mapel", filters.id_mapel)
      if (filters.aggregate_by)
        queryParams.append("aggregate_by", filters.aggregate_by)

      const response = await FetchData({
        url: `${import.meta.env.VITE_API_URL}/all-students-report?${queryParams.toString()}`,
        method: "GET",
        token,
      })

      if (response && response.Data) {
        setStudents(response.Data)
      }

      // Fetch summary data
      const summaryResponse = await FetchData({
        url: `${import.meta.env.VITE_API_URL}/score-report-summary?${queryParams.toString()}`,
        method: "GET",
        token,
      })

      if (summaryResponse && summaryResponse.Data) {
        setSummary(summaryResponse.Data)
      }
    } catch (error) {
      console.error("Error fetching student report:", error)
    } finally {
      setLoading(false)
    }
  }

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  // Filter students based on search term
  const filteredStudents = students.filter((student) => {
    return (
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.nama &&
        student.nama.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })

  // Get mapel name by id
  const getMapelName = (id) => {
    const found = mapel.find((m) => m.id_mapel === Number.parseInt(id))
    return found ? found.mapel : "Unknown"
  }

  // Get kelas name by id
  const getKelasName = (id) => {
    const found = kelas.find((k) => k.id_kelas === Number.parseInt(id))
    return found ? found.kelas : "Unknown"
  }

  // Export to Excel
  const exportToExcel = async () => {
    if (!filters.id_kelas && !filters.id_mapel) {
      alert("Pilih minimal kelas atau mata pelajaran")
      return
    }

    setExportLoading(true)
    try {
      const token = localStorage.getItem("access_token")
      const queryParams = new URLSearchParams()

      if (filters.id_kelas) queryParams.append("id_kelas", filters.id_kelas)
      if (filters.id_mapel) queryParams.append("id_mapel", filters.id_mapel)
      if (filters.aggregate_by)
        queryParams.append("aggregate_by", filters.aggregate_by)

      const response = await FetchData({
        url: `${import.meta.env.VITE_API_URL}/all-students-report?${queryParams.toString()}`,
        method: "GET",
        token,
      })

      if (response && response.Data) {
        // Prepare data for Excel
        const excelData = response.Data.map((student) => {
          const scoreData =
            student.scores.length > 0
              ? student.scores[0].skor
              : "Belum mengerjakan"

          return {
            Email: student.email,
            Nama: student.nama || "-",
            Kelas: student.kelas || getKelasName(student.id_kelas),
            Nilai: scoreData,
            Status: student.has_activity
              ? "Sudah mengerjakan"
              : "Belum mengerjakan",
          }
        })

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(excelData)

        // Create workbook
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Nilai")

        // Generate title
        let title = "Laporan Nilai"
        if (filters.id_kelas) {
          title += ` - Kelas ${getKelasName(filters.id_kelas)}`
        }
        if (filters.id_mapel) {
          title += ` - ${getMapelName(filters.id_mapel)}`
        }

        // Export to Excel file
        XLSX.writeFile(workbook, `${title}.xlsx`)
      }
    } catch (error) {
      console.error("Error exporting to Excel:", error)
      alert("Gagal mengekspor data")
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Laporan Nilai Siswa
        </h1>
        <button
          onClick={exportToExcel}
          disabled={exportLoading || students.length === 0}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {exportLoading ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Export Excel
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kelas
            </label>
            <select
              name="id_kelas"
              value={filters.id_kelas}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Pilih Kelas</option>
              {kelas.map((k) => (
                <option key={k.id_kelas} value={k.id_kelas}>
                  {k.kelas}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-1/4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mata Pelajaran
            </label>
            <select
              name="id_mapel"
              value={filters.id_mapel}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Pilih Mata Pelajaran</option>
              {mapel.map((m) => (
                <option key={m.id_mapel} value={m.id_mapel}>
                  {m.mapel}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-1/4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Metode Agregasi
            </label>
            <select
              name="aggregate_by"
              value={filters.aggregate_by}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="highest">Nilai Tertinggi</option>
              <option value="first">Nilai Pertama</option>
            </select>
          </div>
          <div className="w-full md:w-1/4">
            <button
              onClick={fetchStudentReport}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Filter className="w-4 h-4 mr-2" />
              )}
              Tampilkan
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Siswa</h3>
            <p className="text-2xl font-bold">{summary.total_siswa}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-500">
              Nilai Rata-rata
            </h3>
            <p className="text-2xl font-bold">{summary.nilai_rata2}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-500">Nilai Minimum</h3>
            <p className="text-2xl font-bold">{summary.nilai_min}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-500">
              Nilai Maksimum
            </h3>
            <p className="text-2xl font-bold">{summary.nilai_max}</p>
          </div>
        </div>
      )}

      {/* Distribution Chart */}
      {summary && summary.distribusi && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">Distribusi Nilai</h2>
          <div className="flex items-end h-48">
            {summary.distribusi.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="w-full mx-1 rounded-t-md bg-indigo-600"
                  style={{
                    height: `${(item.jumlah / summary.total_siswa) * 100}%`,
                    minHeight: item.jumlah > 0 ? "10%" : "0%",
                  }}
                ></div>
                <div className="text-xs font-medium mt-2">{item.kategori}</div>
                <div className="text-sm font-bold">{item.jumlah}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Cari siswa..."
          value={searchTerm}
          onChange={handleSearch}
          className="pl-10 p-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kelas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nilai
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.nama || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.kelas || getKelasName(student.id_kelas)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.has_activity && student.scores.length > 0
                        ? student.scores[0].skor
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          student.has_activity
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {student.has_activity
                          ? "Sudah mengerjakan"
                          : "Belum mengerjakan"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    {students.length === 0
                      ? "Pilih kelas dan/atau mata pelajaran untuk menampilkan data"
                      : "Tidak ada data yang sesuai dengan pencarian"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
