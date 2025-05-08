"use client"

import { useEffect, useState } from "react"
import {
  Users,
  BookOpen,
  FileText,
  CheckCircle,
  ArrowUpRight,
  BarChart3,
} from "lucide-react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js"
import { Line } from "react-chartjs-2"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
)

export default function HomePage() {
  const [stats, setStats] = useState({
    users: 0,
    mapel: 0,
    modules: 0,
    soal: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  const [chartLoading, setChartLoading] = useState(true)
  const [chartData, setChartData] = useState([])
  const [chartPeriod, setChartPeriod] = useState("week") // Default to week

  // Fetch logs data based on selected period
  const fetchLogsData = async (period) => {
    try {
      setChartLoading(true)
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/logs-periode?periode=${period}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to fetch logs data")
      }

      const data = await response.json()
      setChartData(data.Data || [])
    } catch (error) {
      console.error("Error fetching logs data:", error)
      setChartData([])
    } finally {
      setChartLoading(false)
    }
  }

  // Process logs data for chart
  const processChartData = () => {
    // Group logs by date
    const groupedByDate = {}

    chartData.forEach((log) => {
      // Extract date part only from created_at
      const date = new Date(log.created_at).toLocaleDateString()

      if (!groupedByDate[date]) {
        groupedByDate[date] = 0
      }
      groupedByDate[date]++
    })

    // Sort dates
    const sortedDates = Object.keys(groupedByDate).sort(
      (a, b) => new Date(a) - new Date(b),
    )

    return {
      labels: sortedDates,
      datasets: [
        {
          label: "Aktivitas Pengguna",
          data: sortedDates.map((date) => groupedByDate[date]),
          borderColor: "rgb(79, 70, 229)",
          backgroundColor: "rgba(79, 70, 229, 0.2)",
          tension: 0.3,
          fill: true,
        },
      ],
    }
  }

  // Handle period change
  const handlePeriodChange = (period) => {
    setChartPeriod(period)
    fetchLogsData(period)
  }

  // Mock data for demonstration
  useEffect(() => {
    console.log(`Bearer ${localStorage.getItem("access_token")}`)

    const fetchData = async () => {
      try {
        // In a real app, you would fetch this data from your API
        // For now, we'll use mock data

        setLoading(true)
        // =============== Fetch User Data ========================
        // Fetch real user data from the API
        const getAllUsersResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/all-stats`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          },
        )

        if (!getAllUsersResponse.ok) {
          throw new Error("Failed to fetch data")
        }

        const userData = await getAllUsersResponse.json()
        // =============== Fetch User Data ========================
        // =============== Fetch Mapel Data ========================
        // Fetch real user data from the API
        const getAllMapelResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/genericAllMapels`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          },
        )

        if (!getAllMapelResponse.ok) {
          throw new Error("Failed to fetch data")
        }

        const mapelData = await getAllMapelResponse.json()
        // =============== END Fetch User Mapel ========================
        // =============== Fetch Stats Lainnya ========================
        // Fetch real user data from the API
        const getStats = await fetch(`${import.meta.env.VITE_API_URL}/stats `, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        })

        if (!getStats.ok) {
          throw new Error("Failed to fetch data")
        }

        const statsData = await getStats.json()
        // =============== end Fetch stats lainnya ========================

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setStats({
          users: userData.data ? userData.data.total_users : 0,
          mapel: userData.data ? userData.data.total_mapel : 0,
          modules: userData.data ? userData.data.total_module : 0,
          soal: userData.data ? userData.data.total_soal : 0,
        })

        setRecentActivity([
          {
            id: 1,
            type: "soal",
            title: "Soal Matematika Kelas 6 ditambahkan",
            time: "2 jam yang lalu",
          },
          {
            id: 2,
            type: "user",
            title: "Pengguna baru: Budi Santoso",
            time: "5 jam yang lalu",
          },
          {
            id: 3,
            type: "module",
            title: "Modul Bahasa Indonesia diperbarui",
            time: "1 hari yang lalu",
          },
          {
            id: 4,
            type: "mapel",
            title: "Mata pelajaran IPA ditambahkan",
            time: "2 hari yang lalu",
          },
        ])
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    fetchLogsData(chartPeriod) // Initial fetch of logs data
  }, [])

  const statCards = [
    {
      title: "Total Pengguna",
      value: stats.users,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Mata Pelajaran",
      value: stats.mapel,
      icon: BookOpen,
      color: "bg-green-500",
    },
    {
      title: "Modul",
      value: stats.modules,
      icon: FileText,
      color: "bg-purple-500",
    },
    {
      title: "Soal",
      value: stats.soal,
      icon: CheckCircle,
      color: "bg-amber-500",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `Aktivitas Pengguna (${chartPeriod === "today" ? "Hari Ini" : chartPeriod === "week" ? "Minggu Ini" : "Bulan Ini"})`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0, // Only show whole numbers
        },
      },
    },
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-6 transition-all hover:shadow-md"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              <button
                onClick={() => handlePeriodChange("today")}
                className={`px-3 py-1 text-sm rounded-md ${
                  chartPeriod === "today"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Hari Ini
              </button>
              <button
                onClick={() => handlePeriodChange("week")}
                className={`px-3 py-1 text-sm rounded-md ${
                  chartPeriod === "week"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Minggu Ini
              </button>
              <button
                onClick={() => handlePeriodChange("month")}
                className={`px-3 py-1 text-sm rounded-md ${
                  chartPeriod === "month"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Bulan Ini
              </button>
            </div>
          </div>
          <div className="h-64">
            {chartLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : chartData.length > 0 ? (
              <Line options={chartOptions} data={processChartData()} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <p>Tidak ada data aktivitas untuk periode ini</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Aktivitas Terbaru
            </h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
              Semua <ArrowUpRight className="w-3 h-3 ml-1" />
            </button>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start pb-4 border-b border-gray-100 last:border-0"
              >
                <div className="mr-4">
                  {activity.type === "user" && (
                    <Users className="w-5 h-5 text-blue-500" />
                  )}
                  {activity.type === "mapel" && (
                    <BookOpen className="w-5 h-5 text-green-500" />
                  )}
                  {activity.type === "module" && (
                    <FileText className="w-5 h-5 text-purple-500" />
                  )}
                  {activity.type === "soal" && (
                    <CheckCircle className="w-5 h-5 text-amber-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
