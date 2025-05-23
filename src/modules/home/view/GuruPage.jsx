// components/StudentCharts.jsx
// import React from "react";
// import {
//   Line,
//   Doughnut,
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   ArcElement,
//   Tooltip,
//   Legend,
// } from "chart.js";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   ArcElement,
//   Tooltip,
//   Legend
// );

// ✅ Correct way
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js"

import { Line, Doughnut } from "react-chartjs-2"

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
)

const StudentCharts = () => {
  const lineData = {
    labels: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"],
    datasets: [
      {
        label: "Progres (%)",
        data: [20, 40, 35, 65, 80],
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79, 70, 229, 0.2)",
        fill: true,
        tension: 0.3,
      },
    ],
  }

  const doughnutData = {
    labels: ["Hadir", "Tidak Hadir", "gajelas"],
    datasets: [
      {
        data: [80, 15, 5],
        backgroundColor: ["#10b981", "#ef4444", "#db1415"],
        hoverOffset: 4,
      },
    ],
  }

  const chartContainerStyle =
    "w-[90%] max-w-[700px] mx-auto my-10 bg-white p-6 rounded-2xl shadow-md"

  return (
    <div className="min-h-screen bg-[#f5f7fa] font-[Segoe UI] p-4">
      <div className={chartContainerStyle}>
        <h2 className="text-2xl font-semibold text-gray-800">
          Progres Siswa per Hari
        </h2>
        <Line data={lineData} />
      </div>

      <div className={chartContainerStyle}>
        <h2 className="text-2xl font-semibold text-gray-800">
          Persentase Kehadiran
        </h2>
        <Doughnut data={doughnutData} />
      </div>
    </div>
  )
}

export default StudentCharts
