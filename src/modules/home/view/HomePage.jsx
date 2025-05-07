"use client"

import { useEffect, useState } from "react"
import { Users, BookOpen, FileText, CheckCircle, ArrowUpRight, BarChart3 } from "lucide-react"

export default function HomePage() {
  const [stats, setStats] = useState({
    users: 0,
    mapel: 0,
    modules: 0,
    soal: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  // Mock data for demonstration
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, you would fetch this data from your API
        // For now, we'll use mock data

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setStats({
          users: 42,
          mapel: 8,
          modules: 24,
          soal: 156,
        })

        setRecentActivity([
          { id: 1, type: "soal", title: "Soal Matematika Kelas 6 ditambahkan", time: "2 jam yang lalu" },
          { id: 2, type: "user", title: "Pengguna baru: Budi Santoso", time: "5 jam yang lalu" },
          { id: 3, type: "module", title: "Modul Bahasa Indonesia diperbarui", time: "1 hari yang lalu" },
          { id: 4, type: "mapel", title: "Mata pelajaran IPA ditambahkan", time: "2 hari yang lalu" },
        ])
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const statCards = [
    { title: "Total Pengguna", value: stats.users, icon: Users, color: "bg-blue-500" },
    { title: "Mata Pelajaran", value: stats.mapel, icon: BookOpen, color: "bg-green-500" },
    { title: "Modul", value: stats.modules, icon: FileText, color: "bg-purple-500" },
    { title: "Soal", value: stats.soal, icon: CheckCircle, color: "bg-amber-500" },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
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
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 transition-all hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
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
            <h2 className="text-lg font-semibold text-gray-800">Aktivitas Pengguna</h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Lihat Detail</button>
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="flex flex-col items-center text-gray-400">
              <BarChart3 className="w-12 h-12 mb-2" />
              <p>Grafik aktivitas pengguna akan ditampilkan di sini</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Aktivitas Terbaru</h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
              Semua <ArrowUpRight className="w-3 h-3 ml-1" />
            </button>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start pb-4 border-b border-gray-100 last:border-0">
                <div className="mr-4">
                  {activity.type === "user" && <Users className="w-5 h-5 text-blue-500" />}
                  {activity.type === "mapel" && <BookOpen className="w-5 h-5 text-green-500" />}
                  {activity.type === "module" && <FileText className="w-5 h-5 text-purple-500" />}
                  {activity.type === "soal" && <CheckCircle className="w-5 h-5 text-amber-500" />}
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