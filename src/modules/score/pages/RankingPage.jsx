"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Search,
  RefreshCw,
  Trophy,
  Medal,
  Award,
  Users,
  ChevronDown,
  ArrowUp,
  Star,
  Sparkles,
} from "lucide-react"
import RefreshToken from "../../../components/_common_/RefreshToken"

export default function RankingPage() {
  const navigate = useNavigate()
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState("")
  const [classes, setClasses] = useState([])

  // Fetch classes for the filter dropdown
  const fetchClasses = async () => {
    try {
      const response = await fetch(`${window.env.VITE_API_URL}/kelas`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setClasses(data)
          // Set the first class as default if available
          if (data.length > 0) {
            setSelectedClass(data[0].id_kelas.toString())
          }
        }
      }
    } catch (error) {
      console.error("Error fetching classes:", error)
    }
  }

  // Fetch rankings
  const fetchRankings = async () => {
    setLoading(true)
    setError(null)

    try {
      // Construct the URL with the class filter if selected
      const url = selectedClass
        ? `${window.env.VITE_API_URL}/ranking?id_kelas=${selectedClass}`
        : `${window.env.VITE_API_URL}/ranking`

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
          navigate("/login", { replace: true })
          return
        }
      }

      const data = await response.json()

      if (data.data) {
        setRankings(data.data)
      } else {
        setRankings([])
        setError("No rankings found or error fetching data")
      }
    } catch (error) {
      console.error("Error fetching rankings:", error)
      setError("Failed to fetch rankings. Please try again.")
      setRankings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      fetchRankings()
    }
  }, [selectedClass])

  // Filter rankings by search term
  const filteredRankings = rankings.filter((rank) =>
    rank.nama?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Get top 3 students for the leaderboard
  const topThree = filteredRankings.slice(0, 3)

  // Get rank color based on position
  const getRankColor = (ranking) => {
    switch (ranking) {
      case 1:
        return "text-yellow-500" // Gold
      case 2:
        return "text-gray-400" // Silver
      case 3:
        return "text-amber-600" // Bronze
      default:
        return "text-gray-700"
    }
  }

  // Get rank icon based on position
  const getRankIcon = (ranking) => {
    switch (ranking) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return (
          <span className="w-6 h-6 inline-flex items-center justify-center font-bold">
            {ranking}
          </span>
        )
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Student Rankings
          </h1>
          <p className="text-gray-500">
            View student rankings based on experience points
          </p>
        </div>
        <button
          onClick={() => navigate("/scores")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          View Scores
        </button>
      </div>

      {/* Top 3 Leaderboard */}
      {!loading && topThree.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Trophy className="mr-2 text-yellow-500" />
            Leaderboard
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Second Place */}
            {topThree.length > 1 && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col items-center order-2 md:order-1 transform hover:scale-105 transition-transform">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4 border-4 border-gray-300">
                  <Medal className="w-8 h-8 text-gray-400" />
                </div>
                <div className="text-xl font-bold text-gray-400">#2</div>
                <div className="text-lg font-semibold mt-2">
                  {topThree[1].nama || "No Name"}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Class {topThree[1].kelas}
                </div>
                <div className="mt-3 flex items-center">
                  <Sparkles className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="font-bold">{topThree[1].exp} XP</span>
                </div>
              </div>
            )}

            {/* First Place */}
            {topThree.length > 0 && (
              <div className="bg-gradient-to-b from-yellow-50 to-white rounded-xl shadow-lg p-6 border border-yellow-200 flex flex-col items-center order-1 md:order-2 transform hover:scale-105 transition-transform -mt-4 md:mt-0 md:-mt-4 z-10">
                <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mb-4 border-4 border-yellow-300">
                  <Trophy className="w-10 h-10 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold text-yellow-500">#1</div>
                <div className="text-xl font-semibold mt-2">
                  {topThree[0].nama || "No Name"}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Class {topThree[0].kelas}
                </div>
                <div className="mt-3 flex items-center">
                  <Sparkles className="w-5 h-5 text-yellow-500 mr-1" />
                  <span className="font-bold text-lg">
                    {topThree[0].exp} XP
                  </span>
                </div>
                <div className="mt-2 px-3 py-1 bg-yellow-100 rounded-full text-xs font-medium text-yellow-700">
                  Top Student
                </div>
              </div>
            )}

            {/* Third Place */}
            {topThree.length > 2 && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col items-center order-3 transform hover:scale-105 transition-transform">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4 border-4 border-amber-200">
                  <Award className="w-8 h-8 text-amber-600" />
                </div>
                <div className="text-xl font-bold text-amber-600">#3</div>
                <div className="text-lg font-semibold mt-2">
                  {topThree[2].nama || "No Name"}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Class {topThree[2].kelas}
                </div>
                <div className="mt-3 flex items-center">
                  <Sparkles className="w-4 h-4 text-amber-500 mr-1" />
                  <span className="font-bold">{topThree[2].exp} XP</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
                placeholder="Search by student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Users
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.id_kelas} value={cls.id_kelas.toString()}>
                    {cls.kelas}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
              />
            </div>
            <button
              onClick={fetchRankings}
              className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              <RefreshCw size={18} />
              <span className="hidden sm:inline">Refresh</span>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience Points
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRankings.length > 0 ? (
                  filteredRankings.map((rank, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full ${rank.ranking <= 3 ? "bg-gray-100" : ""}`}
                          >
                            {getRankIcon(rank.ranking)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-0">
                            <div
                              className={`text-sm font-medium ${getRankColor(rank.ranking)}`}
                            >
                              {rank.nama || "No Name"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                          Class {rank.kelas}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium flex items-center justify-end">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span>{rank.exp} XP</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No rankings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats Section */}
      {!loading && filteredRankings.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Ranking Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-md">
                  <Trophy className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Top Score</p>
                  <p className="text-xl font-bold">
                    {filteredRankings[0]?.exp || 0} XP
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-md">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    Total Students
                  </p>
                  <p className="text-xl font-bold">{filteredRankings.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <div className="flex items-center">
                <div className="p-2 bg-amber-100 rounded-md">
                  <ArrowUp className="h-5 w-5 text-amber-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    Average XP
                  </p>
                  <p className="text-xl font-bold">
                    {Math.round(
                      filteredRankings.reduce(
                        (sum, rank) => sum + rank.exp,
                        0,
                      ) / filteredRankings.length,
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
