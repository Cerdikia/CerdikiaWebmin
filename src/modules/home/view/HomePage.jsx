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
  const [activitiesLoading, setActivitiesLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(true)
  const [chartData, setChartData] = useState([])
  const [chartPeriod, setChartPeriod] = useState("week") // Default to week

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) {
      return "baru saja"
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} menit yang lalu`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} jam yang lalu`
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} hari yang lalu`
    } else {
      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }
  }

  // Fetch recent activities
  const fetchRecentActivities = async () => {
    try {
      setActivitiesLoading(true)
      const response = await fetch(
        `${window.env.VITE_API_URL}/recent-activities?page=1&limit=7`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to fetch recent activities")
      }

      const data = await response.json()

      if (data.data && data.data.activities) {
        // Format the activities data
        const formattedActivities = data.data.activities.map(
          (activity, index) => ({
            id: activity.id_logs || index,
            email: activity.email,
            mapel: activity.nama_mapel,
            time: formatRelativeTime(activity.created_at),
            type: "user", // Default type for icon
          }),
        )

        setRecentActivity(formattedActivities)
      }
    } catch (error) {
      console.error("Error fetching recent activities:", error)
      setRecentActivity([])
    } finally {
      setActivitiesLoading(false)
    }
  }

  // Fetch logs data based on selected period
  const fetchLogsData = async (period) => {
    try {
      setChartLoading(true)
      const response = await fetch(
        `${window.env.VITE_API_URL}/logs-periode?periode=${period}`,
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
    // const groupedByDate = {}
    // Group logs by date or hour depending on the period
    const groupedData = {}

    chartData.forEach((log) => {
      // Extract date part only from created_at
      // const date = new Date(log.created_at).toLocaleDateString()

      // if (!groupedByDate[date]) {
      //   groupedByDate[date] = 0
      // }
      const date = new Date(log.created_at)

      // For "today" period, group by hour
      if (chartPeriod === "today") {
        // Format hour as "HH:00"
        const hour = date.getHours()
        const hourLabel = `${hour.toString().padStart(2, "0")}:00`

        if (!groupedData[hourLabel]) {
          groupedData[hourLabel] = 0
        }
        groupedData[hourLabel]++
      } else {
        // For week and month periods, continue grouping by date
        const dateStr = date.toLocaleDateString()
        if (!groupedData[dateStr]) {
          groupedData[dateStr] = 0
        }
        // groupedByDate[date]++
        groupedData[dateStr]++
      }
    })

    // Sort dates
    // const sortedDates = Object.keys(groupedByDate).sort(
    //   (a, b) => new Date(a) - new Date(b),
    // )

    // Sort the keys (hours or dates)
    let sortedKeys
    if (chartPeriod === "today") {
      // For today, sort hours numerically (00:00 to 23:00)
      sortedKeys = Object.keys(groupedData).sort((a, b) => {
        return (
          Number.parseInt(a.split(":")[0]) - Number.parseInt(b.split(":")[0])
        )
      })
    } else {
      // For week and month, sort dates chronologically
      sortedKeys = Object.keys(groupedData).sort(
        (a, b) => new Date(a) - new Date(b),
      )
    }

    // Fill in missing hours for today's data to show complete 24-hour period
    if (chartPeriod === "today") {
      const filledData = {}
      for (let i = 0; i < 24; i++) {
        const hourLabel = `${i.toString().padStart(2, "0")}:00`
        filledData[hourLabel] = groupedData[hourLabel] || 0
      }
      // Replace groupedData with the filled version
      return {
        labels: Object.keys(filledData).sort(),
        datasets: [
          {
            label: "Aktivitas Pengguna per Jam",
            data: Object.keys(filledData)
              .sort()
              .map((hour) => filledData[hour]),
            borderColor: "rgb(79, 70, 229)",
            backgroundColor: "rgba(79, 70, 229, 0.2)",
            tension: 0.3,
            fill: true,
          },
        ],
      }
    }

    return {
      // labels: sortedDates,
      labels: sortedKeys,
      datasets: [
        {
          label: "Aktivitas Pengguna",
          // data: sortedDates.map((date) => groupedByDate[date]),
          data: sortedKeys.map((key) => groupedData[key]),
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
    // console.log(`Bearer ${localStorage.getItem("access_token")}`)

    const fetchData = async () => {
      try {
        // In a real app, you would fetch this data from your API
        // For now, we'll use mock data

        setLoading(true)
        // =============== Fetch User Data ========================
        // Fetch real user data from the API
        const getAllUsersResponse = await fetch(
          `${window.env.VITE_API_URL}/all-stats`,
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

        // Simulate API call delay
        // await new Promise((resolve) => setTimeout(resolve, 1000))

        setStats({
          users: userData.data ? userData.data.total_users : 0,
          mapel: userData.data ? userData.data.total_mapel : 0,
          modules: userData.data ? userData.data.total_module : 0,
          soal: userData.data ? userData.data.total_soal : 0,
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentActivities() // Fetch recent activities
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
        // text: `Aktivitas Pengguna (${chartPeriod === "today" ? "Hari Ini" : chartPeriod === "week" ? "Minggu Ini" : "Bulan Ini"})`,
        text: `Aktivitas Pengguna (${
          chartPeriod === "today"
            ? "Hari Ini per Jam"
            : chartPeriod === "week"
              ? "Minggu Ini"
              : "Bulan Ini"
        })`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0, // Only show whole numbers
        },
      },
      x: {
        title: {
          display: chartPeriod === "today",
          text: chartPeriod === "today" ? "Jam" : "",
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
            {/* {recentActivity.map((activity) => ( */}
            {activitiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start pb-4 border-b border-gray-100 last:border-0"
                >
                  <div className="mr-4">
                    {/* {activity.type === "user" && (
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
                  )} */}
                    <CheckCircle className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    {/* <p className="text-sm font-medium">{activity.title}</p> */}
                    <p className="text-sm font-medium">
                      {activity.email} | {activity.mapel}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Tidak ada aktivitas terbaru</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
