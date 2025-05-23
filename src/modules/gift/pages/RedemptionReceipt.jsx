"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
// import { RefreshToken } from "../../../components/_common_/RefreshToken"
// import { DashboardLayout } from "../../../components/_common_/DashboardLayout"
// import { FetchData } from "../../../components/_common_/FetchData"

const RedemptionReceipt = () => {
  const { code } = useParams()
  const navigate = useNavigate()
  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const baseUrl = window.env.VITE_API_URL

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("access_token")
        if (!token) {
          navigate("/login")
          return
        }

        const response = await axios.get(`${baseUrl}/view-receipt/${code}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          // responseType: "json",
          responseType: "text",
        })

        console.log(response.data)

        setReceipt(response.data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching receipt:", error)
        setError(
          error.response?.data?.message ||
            "Terjadi kesalahan saat mengambil data bukti penukaran",
        )
        setLoading(false)
      }
    }

    if (code) {
      fetchReceipt()
    }
  }, [code, navigate, baseUrl])

  const handlePrintReceipt = () => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      navigate("/login")
      return
    }

    // Create a link to download the PDF
    const link = document.createElement("a")
    link.href = `${baseUrl}/print-receipt/${code}`
    link.setAttribute("download", `receipt_${code}.pdf`)
    link.setAttribute("target", "_blank")

    // Add authorization header via fetch
    fetch(link.href, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob)
        link.href = url
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      })
      .catch((error) => {
        console.error("Error downloading PDF:", error)
        alert("Terjadi kesalahan saat mengunduh PDF")
      })
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "waiting":
        return "text-orange-500"
      case "completed":
        return "text-green-500"
      case "cancelled":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    // <DashboardLayout>
    //   <RefreshToken />
    //   <FetchData />
    //   <div className="container mx-auto px-4 py-8">
    //     <div className="flex justify-between items-center mb-6">
    //       <h1 className="text-2xl font-bold">Bukti Penukaran Hadiah</h1>
    //       <button
    //         onClick={() => navigate("/gifts")}
    //         className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
    //       >
    //         Kembali
    //       </button>
    //     </div>

    //     {loading ? (
    //       <div className="flex justify-center items-center h-64">
    //         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    //       </div>
    //     ) : error ? (
    //       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
    //         <strong className="font-bold">Error! </strong>
    //         <span className="block sm:inline">{error}</span>
    //       </div>
    //     ) : receipt ? (
    //       <div className="bg-white shadow-lg rounded-lg overflow-hidden">
    //         {/* Header with Cerdikia branding */}
    //         <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
    //           <div>
    //             <h2 className="text-xl font-bold">Cerdikia</h2>
    //             <p className="text-sm">Bukti Penukaran Hadiah</p>
    //           </div>
    //           <div className="text-right">
    //             <p className="text-sm">Kode Penukaran:</p>
    //             <p className="font-mono font-bold">{code}</p>
    //           </div>
    //         </div>

    //         {/* Student Information */}
    //         <div className="p-6 border-b">
    //           <h3 className="text-lg font-semibold mb-4">Informasi Siswa</h3>
    //           <div className="flex flex-col md:flex-row gap-6">
    //             {receipt.student?.profile_image && (
    //               <div className="w-32 h-32 flex-shrink-0">
    //                 <img
    //                   src={receipt.student.profile_image || "/placeholder.svg"}
    //                   alt={receipt.student?.name || "Siswa"}
    //                   className="w-full h-full object-cover rounded-lg"
    //                 />
    //               </div>
    //             )}
    //             <div className="flex-grow">
    //               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //                 <div>
    //                   <p className="text-gray-600">Nama:</p>
    //                   <p className="font-semibold">
    //                     {receipt.student?.name || "-"}
    //                   </p>
    //                 </div>
    //                 <div>
    //                   <p className="text-gray-600">Email:</p>
    //                   <p className="font-semibold">
    //                     {receipt.student?.email || "-"}
    //                   </p>
    //                 </div>
    //                 <div>
    //                   <p className="text-gray-600">Kelas:</p>
    //                   <p className="font-semibold">
    //                     {receipt.student?.class || "-"}
    //                   </p>
    //                 </div>
    //                 <div>
    //                   <p className="text-gray-600">Status:</p>
    //                   <p
    //                     className={`font-semibold ${getStatusColor(receipt.status)}`}
    //                   >
    //                     {receipt.status || "-"}
    //                   </p>
    //                 </div>
    //               </div>
    //             </div>
    //           </div>
    //         </div>

    //         {/* Redemption Details */}
    //         <div className="p-6 border-b">
    //           <h3 className="text-lg font-semibold mb-4">Detail Penukaran</h3>
    //           <div className="overflow-x-auto">
    //             <table className="min-w-full divide-y divide-gray-200">
    //               <thead className="bg-gray-50">
    //                 <tr>
    //                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //                     Nama Barang
    //                   </th>
    //                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //                     Jumlah
    //                   </th>
    //                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //                     Harga (Diamond)
    //                   </th>
    //                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //                     Total
    //                   </th>
    //                 </tr>
    //               </thead>
    //               <tbody className="bg-white divide-y divide-gray-200">
    //                 {receipt.items?.map((item, index) => (
    //                   <tr key={index}>
    //                     <td className="px-6 py-4 whitespace-nowrap">
    //                       <div className="text-sm font-medium text-gray-900">
    //                         {item.name}
    //                       </div>
    //                     </td>
    //                     <td className="px-6 py-4 whitespace-nowrap">
    //                       <div className="text-sm text-gray-500">
    //                         {item.quantity}
    //                       </div>
    //                     </td>
    //                     <td className="px-6 py-4 whitespace-nowrap">
    //                       <div className="text-sm text-gray-500">
    //                         {item.price}
    //                       </div>
    //                     </td>
    //                     <td className="px-6 py-4 whitespace-nowrap">
    //                       <div className="text-sm text-gray-500">
    //                         {item.quantity * item.price}
    //                       </div>
    //                     </td>
    //                   </tr>
    //                 ))}
    //               </tbody>
    //               <tfoot>
    //                 <tr className="bg-gray-50">
    //                   <td
    //                     colSpan="3"
    //                     className="px-6 py-4 text-right font-semibold"
    //                   >
    //                     Total Diamond:
    //                   </td>
    //                   <td className="px-6 py-4 font-bold text-blue-600">
    //                     {receipt.items?.reduce(
    //                       (total, item) => total + item.quantity * item.price,
    //                       0,
    //                     ) || 0}
    //                   </td>
    //                 </tr>
    //               </tfoot>
    //             </table>
    //           </div>
    //         </div>

    //         {/* Additional Information */}
    //         <div className="p-6 border-b">
    //           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //             <div>
    //               <p className="text-gray-600">Tanggal Penukaran:</p>
    //               <p className="font-semibold">
    //                 {formatDate(receipt.redemption_date)}
    //               </p>
    //             </div>
    //             {receipt.completion_date && (
    //               <div>
    //                 <p className="text-gray-600">Tanggal Selesai:</p>
    //                 <p className="font-semibold">
    //                   {formatDate(receipt.completion_date)}
    //                 </p>
    //               </div>
    //             )}
    //           </div>
    //         </div>

    //         {/* Actions */}
    //         <div className="p-6 flex justify-end">
    //           <button
    //             onClick={handlePrintReceipt}
    //             className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded flex items-center"
    //           >
    //             <svg
    //               xmlns="http://www.w3.org/2000/svg"
    //               className="h-5 w-5 mr-2"
    //               fill="none"
    //               viewBox="0 0 24 24"
    //               stroke="currentColor"
    //             >
    //               <path
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth={2}
    //                 d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
    //               />
    //             </svg>
    //             Cetak Bukti Penukaran
    //           </button>
    //         </div>

    //         {/* Footer */}
    //         <div className="bg-gray-100 p-4 text-center text-sm text-gray-600">
    //           <p>Bukti penukaran ini merupakan dokumen resmi dari Cerdikia.</p>
    //           <p>
    //             © {new Date().getFullYear()} Cerdikia. All rights reserved.
    //           </p>
    //         </div>
    //       </div>
    //     ) : (
    //       <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4">
    //         <strong className="font-bold">Perhatian! </strong>
    //         <span className="block sm:inline">
    //           Bukti penukaran dengan kode {code} tidak ditemukan.
    //         </span>
    //       </div>
    //     )}
    //   </div>
    // </DashboardLayout>
    <div
      className="container mx-auto px-4 py-8"
      dangerouslySetInnerHTML={{ __html: receipt }}
    />
    // <div className="">
    //   <h1>ok</h1>
    // </div>
  )
}

export default RedemptionReceipt
