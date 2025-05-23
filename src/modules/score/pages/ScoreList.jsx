"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  Search,
  RefreshCw,
  Filter,
  ArrowUpDown,
  Download,
  Users,
  Award,
  TrendingUp,
  BookOpen,
} from "lucide-react"
import RefreshToken from "../../../components/_common_/RefreshToken"

export default function ScoreList() {
  const navigate = useNavigate()
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  })

  // Fetch classes for the filter dropdown
  const fetchClasses = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/kelas`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log(data)

        // if (data.Data && Array.isArray(data.Data)) {
        if (data) {
          setClasses(data)
        }
      }
    } catch (error) {
      console.error("Error fetching classes:", error)
    }
  }

  // Fetch subjects for the filter dropdown
  const fetchSubjects = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/genericAllMapels`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      )

      if (response.ok) {
        const data = await response.json()
        if (data.Data && Array.isArray(data.Data)) {
          setSubjects(data.Data)
        }
      }
    } catch (error) {
      console.error("Error fetching subjects:", error)
    }
  }

  // Fetch all scores
  const fetchScores = async () => {
    setLoading(true)
    setError(null)

    try {
      let response = await fetch(
        `${import.meta.env.VITE_API_URL}/gegeralLogs`,
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
            `${import.meta.env.VITE_API_URL}/gegeralLogs`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              },
            },
          )
        } else {
          navigate("/login", { replace: true })
          return
        }
      }

      const data = await response.json()

      if (data.Message === "Data retrived Successfuly" && data.Data) {
        setScores(data.Data)
      } else {
        setScores([])
        setError("No scores found or error fetching data")
      }
    } catch (error) {
      console.error("Error fetching scores:", error)
      setError("Failed to fetch scores. Please try again.")
      setScores([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScores()
    fetchClasses()
    fetchSubjects()
  }, [])

  // Function to handle sorting
  const requestSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  // Process scores to get unique entries (first score for each unique combination)
  const processedScores = useMemo(() => {
    // Create a map to store unique combinations
    const uniqueMap = new Map()

    // Sort by created_at to ensure we process oldest/newest first based on sort direction
    const sortedScores = [...scores].sort((a, b) => {
      const dateA = new Date(a.created_at)
      const dateB = new Date(b.created_at)
      return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA
    })

    // Process each score
    sortedScores.forEach((score) => {
      // Create a unique key for each email+mapel+kelas+module combination
      const key = `${score.email}-${score.id_mapel}-${score.id_kelas}-${score.id_module}`

      // Only add to map if this combination doesn't exist yet (first occurrence)
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, score)
      }
    })

    // Convert map values back to array
    return Array.from(uniqueMap.values())
  }, [scores, sortConfig.direction])

  // Apply filters and sorting to the processed scores
  const filteredAndSortedScores = useMemo(() => {
    // First apply filters
    const result = processedScores.filter((score) => {
      const matchesSearch = score.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      const matchesClass =
        selectedClass === "" || score.id_kelas.toString() === selectedClass
      const matchesSubject =
        selectedSubject === "" || score.id_mapel.toString() === selectedSubject
      return matchesSearch && matchesClass && matchesSubject
    })

    // Then apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
      })
    }

    return result
  }, [processedScores, searchTerm, selectedClass, selectedSubject, sortConfig])

  // Function to get class name from id
  const getClassName = (classId) => {
    const foundClass = classes.find((c) => c.id_kelas === classId)
    return foundClass ? foundClass.kelas : `Class ${classId}`
  }

  // Function to get subject name from id
  const getSubjectName = (subjectId) => {
    const foundSubject = subjects.find((s) => s.id_mapel === subjectId)
    return foundSubject ? foundSubject.mapel : `Subject ${subjectId}`
  }

  // Calculate statistics for the filtered scores
  const statistics = useMemo(() => {
    if (filteredAndSortedScores.length === 0) {
      return {
        totalStudents: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passingRate: 0,
        classBreakdown: [],
        subjectBreakdown: [],
      }
    }

    // Get unique students
    const uniqueStudents = new Set(
      filteredAndSortedScores.map((score) => score.email),
    ).size

    // Calculate average score
    const totalScore = filteredAndSortedScores.reduce(
      (sum, score) => sum + score.skor,
      0,
    )
    const averageScore = totalScore / filteredAndSortedScores.length

    // Find highest and lowest scores
    const highestScore = Math.max(
      ...filteredAndSortedScores.map((score) => score.skor),
    )
    const lowestScore = Math.min(
      ...filteredAndSortedScores.map((score) => score.skor),
    )

    // Calculate passing rate (scores >= 60)
    const passingScores = filteredAndSortedScores.filter(
      (score) => score.skor >= 60,
    ).length
    const passingRate = (passingScores / filteredAndSortedScores.length) * 100

    // Class breakdown
    const classCounts = {}
    const classScores = {}
    filteredAndSortedScores.forEach((score) => {
      const classId = score.id_kelas
      if (!classCounts[classId]) {
        classCounts[classId] = 0
        classScores[classId] = 0
      }
      classCounts[classId]++
      classScores[classId] += score.skor
    })

    const classBreakdown = Object.keys(classCounts).map((classId) => {
      const className = getClassName(Number.parseInt(classId))
      const count = classCounts[classId]
      const avgScore = classScores[classId] / count
      return { id: classId, name: className, count, averageScore: avgScore }
    })

    // Subject breakdown
    const subjectCounts = {}
    const subjectScores = {}
    filteredAndSortedScores.forEach((score) => {
      const subjectId = score.id_mapel
      if (!subjectCounts[subjectId]) {
        subjectCounts[subjectId] = 0
        subjectScores[subjectId] = 0
      }
      subjectCounts[subjectId]++
      subjectScores[subjectId] += score.skor
    })

    const subjectBreakdown = Object.keys(subjectCounts).map((subjectId) => {
      const subjectName = getSubjectName(Number.parseInt(subjectId))
      const count = subjectCounts[subjectId]
      const avgScore = subjectScores[subjectId] / count
      return { id: subjectId, name: subjectName, count, averageScore: avgScore }
    })

    return {
      totalStudents: uniqueStudents,
      averageScore,
      highestScore,
      lowestScore,
      passingRate,
      classBreakdown,
      subjectBreakdown,
    }
  }, [filteredAndSortedScores])

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Function to export data to CSV
  const exportToCSV = () => {
    if (filteredAndSortedScores.length === 0) return

    // Prepare data with proper headers and formatted values
    const headers = [
      "ID",
      "Email",
      "Class",
      "Subject",
      "Module ID",
      "Score",
      "Date",
    ]

    const csvData = filteredAndSortedScores.map((score) => [
      score.id_logs,
      score.email,
      getClassName(score.id_kelas),
      getSubjectName(score.id_mapel),
      score.id_module,
      score.skor,
      formatDate(score.created_at),
    ])

    // Convert to CSV format with proper escaping for commas and quotes
    const processRow = (row) => {
      return row
        .map((value) => {
          // Convert to string and escape quotes
          const stringValue = String(value).replace(/"/g, '""')
          // Wrap in quotes if contains comma, newline or quote
          return /[",\n]/.test(stringValue) ? `"${stringValue}"` : stringValue
        })
        .join(",")
    }

    const csvContent = [
      processRow(headers),
      ...csvData.map((row) => processRow(row)),
    ].join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `student_scores_${new Date().toISOString().slice(0, 10)}.csv`,
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Student Score Management</h1>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          disabled={filteredAndSortedScores.length === 0}
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Statistics Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Score Statistics</h2>

        {loading ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-md">
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">
                      Total Students
                    </p>
                    <p className="text-xl font-bold">
                      {statistics.totalStudents}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-md">
                    <Award className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">
                      Average Score
                    </p>
                    <p className="text-xl font-bold">
                      {statistics.averageScore.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <div className="flex items-center">
                  <div className="p-2 bg-amber-100 rounded-md">
                    <TrendingUp className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">
                      Highest Score
                    </p>
                    <p className="text-xl font-bold">
                      {statistics.highestScore}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-md">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">
                      Passing Rate
                    </p>
                    <p className="text-xl font-bold">
                      {statistics.passingRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Class and Subject Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Class Breakdown */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Class Performance
                </h3>
                <div className="space-y-2">
                  {statistics.classBreakdown.map((cls) => (
                    <div key={cls.id} className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{cls.name}</span>
                        <span className="text-sm text-gray-500">
                          {cls.count} scores
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(100, (cls.averageScore / 100) * 100)}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-right text-xs mt-1">
                        Avg: {cls.averageScore.toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject Breakdown */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Subject Performance
                </h3>
                <div className="space-y-2">
                  {statistics.subjectBreakdown.map((subject) => (
                    <div key={subject.id} className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{subject.name}</span>
                        <span className="text-sm text-gray-500">
                          {subject.count} scores
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-green-600 h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(100, (subject.averageScore / 100) * 100)}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-right text-xs mt-1">
                        Avg: {subject.averageScore.toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filters and Table */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.id_kelas} value={cls.id_kelas.toString()}>
                    {cls.kelas}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <BookOpen
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option
                    key={subject.id_mapel}
                    value={subject.id_mapel.toString()}
                  >
                    {subject.mapel}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={fetchScores}
              className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      className="flex items-center"
                      onClick={() => requestSort("email")}
                    >
                      Student Email
                      <ArrowUpDown size={14} className="ml-1" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      className="flex items-center"
                      onClick={() => requestSort("id_kelas")}
                    >
                      Class
                      <ArrowUpDown size={14} className="ml-1" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      className="flex items-center"
                      onClick={() => requestSort("id_mapel")}
                    >
                      Subject
                      <ArrowUpDown size={14} className="ml-1" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      className="flex items-center"
                      onClick={() => requestSort("id_module")}
                    >
                      Module ID
                      <ArrowUpDown size={14} className="ml-1" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      className="flex items-center"
                      onClick={() => requestSort("skor")}
                    >
                      Score
                      <ArrowUpDown size={14} className="ml-1" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      className="flex items-center"
                      onClick={() => requestSort("created_at")}
                    >
                      Date
                      <ArrowUpDown size={14} className="ml-1" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedScores.length > 0 ? (
                  filteredAndSortedScores.map((score) => (
                    <tr key={score.id_logs} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {score.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getClassName(score.id_kelas)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getSubjectName(score.id_mapel)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {score.id_module}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            score.skor >= 70
                              ? "bg-green-100 text-green-800"
                              : score.skor >= 50
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {score.skor}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(score.created_at)}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No scores found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
