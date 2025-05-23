"use client"

import { useState, useEffect } from "react"
import { X, FileText, Save } from "lucide-react"

export default function ModuleModal({
  endpoint,
  method = "POST",
  isOpen,
  onClose,
  onSave,
  kelasOptions = [],
  fields = [],
  detailData = {},
  editData = null,
}) {
  const [id_kelas, setid_kelas] = useState(0)
  const [, setid_mapel] = useState(detailData.value)
  const [module, setmodule] = useState(0)
  const [module_judul, setmodule_judul] = useState("")
  const [module_deskripsi, setmodule_deskripsi] = useState("")
  const [loading, setLoading] = useState(false)

  // Set form data when editing
  useEffect(() => {
    if (editData) {
      setid_kelas(editData.id_kelas || 0)
      setid_mapel(editData.id_mapel || detailData.value)
      setmodule(editData.module || 0)
      setmodule_judul(editData.module_judul || "")
      setmodule_deskripsi(editData.module_deskripsi || "")
    } else {
      setid_kelas(0)
      setid_mapel(detailData.value)
      setmodule(0)
      setmodule_judul("")
      setmodule_deskripsi("")
    }
  }, [editData, detailData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const formData = {}

    if (fields.includes("id_kelas")) formData.id_kelas = id_kelas
    if (fields.includes("id_mapel")) formData.id_mapel = detailData.value
    if (fields.includes("module")) formData.module = module
    if (fields.includes("module_judul")) formData.module_judul = module_judul
    if (fields.includes("module_deskripsi"))
      formData.module_deskripsi = module_deskripsi

    try {
      const response = await fetch(`${window.env.VITE_API_URL}/${endpoint}`, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSave({
          id_module: editData?.id_module,
          id_kelas,
          id_mapel: detailData.value,
          module,
          module_judul,
          module_deskripsi,
        })

        // Reset form
        setid_kelas(0)
        setmodule(0)
        setmodule_judul("")
        setmodule_deskripsi("")
        onClose()
      } else {
        const errorData = await response.text()
        console.error("Failed to save module:", errorData)
        alert("Gagal menyimpan modul")
      }
    } catch (error) {
      console.error("Error saving module:", error)
      alert("Terjadi kesalahan saat menyimpan modul")
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
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
    >
      <div
        onClick={handleModalClick}
        className="bg-white rounded-xl shadow-lg w-full max-w-md transform transition-all duration-300"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-indigo-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">
              {editData ? "Edit Modul" : "Tambah Modul"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {showField("id_mapel") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {detailData.title}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  value={detailData.text}
                  required
                  readOnly
                />
              </div>
            )}

            {showField("id_kelas") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kelas <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={id_kelas}
                  onChange={(e) => setid_kelas(Number.parseInt(e.target.value))}
                  required
                >
                  <option value="">Pilih Kelas</option>
                  {kelasOptions?.length > 0 &&
                    kelasOptions.map((kelas) => (
                      <option key={kelas.id_kelas} value={kelas.id_kelas}>
                        {kelas.kelas}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {showField("module") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Modul <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={module}
                  onChange={(e) => setmodule(Number.parseInt(e.target.value))}
                  required
                  min="1"
                />
              </div>
            )}

            {showField("module_judul") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Modul <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={module_judul}
                  onChange={(e) => setmodule_judul(e.target.value)}
                  required
                  placeholder="Contoh: Pengenalan Aljabar"
                />
              </div>
            )}

            {showField("module_deskripsi") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi Modul <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={module_deskripsi}
                  onChange={(e) => setmodule_deskripsi(e.target.value)}
                  required
                  rows="3"
                  placeholder="Deskripsi singkat tentang modul ini"
                />
              </div>
            )}
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
