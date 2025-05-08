"use client"

import { useState, useEffect } from "react"
import { X, Book, Save } from "lucide-react"

export default function MapelModal({
  endpoint,
  method = "POST",
  isOpen,
  onClose,
  onSave,
  fields = [],
  editData = null,
  kelasList = [],
}) {
  const [mapel, setMapel] = useState("")
  const [kelasId, setKelasId] = useState("")
  const [loading, setLoading] = useState(false)

  // Set form data when editing
  useEffect(() => {
    if (editData) {
      setMapel(editData.mapel || "")
      setKelasId(editData.kelas || "")
    } else {
      setMapel("")
      setKelasId("")
    }
  }, [editData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const formData = {}

    if (fields.includes("mapel")) formData.mapel = mapel
    if (kelasId) formData.id_kelas = Number.parseInt(kelasId)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}`, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSave({
          id_mapel: editData?.id_mapel,
          mapel,
          kelas: kelasId ? kelasId : null,
          modules_count: editData?.modules_count || 0,
        })
        setMapel("")
        setKelasId("")
        onClose()
      } else {
        const errorData = await response.text()
        console.error("Failed to save subject:", errorData)
        alert("Gagal menyimpan mata pelajaran")
      }
    } catch (error) {
      console.error("Error saving subject:", error)
      alert("Terjadi kesalahan saat menyimpan mata pelajaran")
    } finally {
      setLoading(false)
    }
  }

  const handleModalClick = (e) => {
    e.stopPropagation()
  }

  const showField = (fieldName) => fields.includes(fieldName)

  if (!isOpen) return null

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div
        onClick={handleModalClick}
        className="bg-white rounded-xl shadow-lg w-full max-w-md transform transition-all duration-300"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center">
            <Book className="w-5 h-5 text-indigo-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">
              {editData ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {showField("mapel") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Mata Pelajaran <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={mapel}
                  onChange={(e) => setMapel(e.target.value)}
                  placeholder="Contoh: Matematika"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={kelasId}
                onChange={(e) => setKelasId(e.target.value)}
              >
                <option value="">Semua Kelas</option>
                {kelasList.map((kelas) => (
                  <option key={kelas.id_kelas} value={kelas.id_kelas.toString()}>
                    {kelas.kelas}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Opsional. Pilih kelas untuk mata pelajaran ini.</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              onClick={onClose}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:bg-indigo-400"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editData ? "Update" : "Simpan"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
