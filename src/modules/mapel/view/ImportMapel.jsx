"use client"

import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Edit,
} from "lucide-react"
import * as XLSX from "xlsx"
import RefreshToken from "../../../components/_common_/RefreshToken"
import DeleteMapelModal from "../../../components/MapelPage/DeleteMapelModal"

export default function ImportMapel() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [importedData, setImportedData] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [mapelToDelete, setMapelToDelete] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setFileName(selectedFile.name)
      setError(null)
      processExcelFile(selectedFile)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      setFile(droppedFile)
      setFileName(droppedFile.name)
      setError(null)
      processExcelFile(droppedFile)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const processExcelFile = (file) => {
    setLoading(true)
    setError(null)
    setImportedData([])

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: "array" })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        // Check if the file has data
        if (jsonData.length <= 1) {
          setError("Excel file is empty or contains only headers.")
          setLoading(false)
          return
        }

        // Check if the headers are correct
        const headers = jsonData[0]
        const requiredHeaders = ["mapel"]
        const missingHeaders = requiredHeaders.filter(
          (header) => !headers.includes(header),
        )

        if (missingHeaders.length > 0) {
          setError(`Missing required headers: ${missingHeaders.join(", ")}`)
          setLoading(false)
          return
        }

        // Process the data
        const processedData = []
        const errors = []

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i]
          const rowData = {}

          // Map headers to values
          headers.forEach((header, index) => {
            rowData[header] = row[index] !== undefined ? row[index] : ""
          })

          // Validate required fields
          if (!rowData.mapel) {
            errors.push(`Row ${i + 1}: Subject name is required`)
            continue
          }

          processedData.push(rowData)
        }

        if (errors.length > 0) {
          setError(
            `Found ${errors.length} errors in the Excel file:\n${errors.slice(0, 5).join("\n")}${
              errors.length > 5
                ? `\n...and ${errors.length - 5} more errors`
                : ""
            }`,
          )
        }

        if (processedData.length === 0) {
          setError(
            "No valid subjects found in the Excel file after validation.",
          )
        } else {
          setImportedData(processedData)
          setSuccess(
            `Successfully processed ${processedData.length} subjects from Excel file.`,
          )
        }
      } catch (err) {
        console.error("Error processing Excel file:", err)
        setError(
          "Failed to process Excel file. Please make sure it's a valid Excel file.",
        )
      } finally {
        setLoading(false)
      }
    }

    reader.onerror = () => {
      setError("Error reading the file.")
      setLoading(false)
    }

    reader.readAsArrayBuffer(file)
  }

  const downloadTemplate = () => {
    // Create a template workbook
    const wb = XLSX.utils.book_new()
    const headers = ["mapel"]

    // Add example data
    const exampleData = [headers, ["Bahasa Indonesia"], ["Matematika"], ["IPA"]]

    const ws = XLSX.utils.aoa_to_sheet(exampleData)
    XLSX.utils.book_append_sheet(wb, ws, "Template")

    // Generate and download the file
    XLSX.writeFile(wb, "mapel_template.xlsx")
  }

  const handleDeleteClick = (mapel, index) => {
    setMapelToDelete({ ...mapel, index })
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!mapelToDelete) return

    // Remove the subject from importedData
    const updatedData = [...importedData]
    updatedData.splice(mapelToDelete.index, 1)
    setImportedData(updatedData)

    setIsDeleteModalOpen(false)
    setMapelToDelete(null)
    setSuccess("Subject removed from import list.")

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess(null)
    }, 3000)
  }

  const handleSaveImport = async () => {
    try {
      setIsSaving(true)
      setError(null)

      if (importedData.length === 0) {
        setError("No subjects to save. Please import subjects first.")
        setIsSaving(false)
        return
      }

      // Prepare data for API
      const importData = {
        subjects: importedData.map((mapel) => ({
          mapel: mapel.mapel,
        })),
      }

      // Call API to save subjects
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/bulk-upload-mapel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(importData),
        },
      )

      if (!response.ok) {
        if (response.status === 401) {
          const refreshed = await RefreshToken()
          if (!refreshed) {
            navigate("/login", { replace: true })
            return
          }
        }
        throw new Error("Failed to save imported subjects")
      }

      const result = await response.json()

      if (result.Message === "Success") {
        setSuccess("Subjects imported successfully!")

        // Redirect after a short delay
        setTimeout(() => {
          navigate("/admin-mapel")
        }, 1500)
      } else {
        setError(
          "Failed to import subjects: " + (result.Message || "Unknown error"),
        )
      }
    } catch (err) {
      console.error("Import error:", err)
      setError(
        "An error occurred while saving the imported subjects: " + err.message,
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header with back button and title */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Import Subjects from Excel
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Upload an Excel file with subjects
          </p>
        </div>
      </div>

      {/* Notification messages */}
      {error && (
        <div className="mb-6 p-4 border-l-4 border-red-500 bg-red-50 text-red-700 flex items-start">
          <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <div className="whitespace-pre-line">{error}</div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 border-l-4 border-green-500 bg-green-50 text-green-700 flex items-start">
          <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{success}</p>
        </div>
      )}

      {/* File upload area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Upload Excel File
          </h2>
        </div>

        <div
          className="p-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg mx-6 my-6 cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx,.xls"
            className="hidden"
          />

          <div className="p-4 rounded-full bg-indigo-50 mb-4">
            <Upload className="h-8 w-8 text-indigo-600" />
          </div>

          {loading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
              <p className="text-sm text-gray-500">Processing file...</p>
            </div>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-700 mb-1">
                {fileName
                  ? `File: ${fileName}`
                  : "Drag and drop your Excel file here"}
              </p>
              <p className="text-sm text-gray-500 mb-4">or click to browse</p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  downloadTemplate()
                }}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
              >
                <FileSpreadsheet className="h-4 w-4 mr-1" />
                Download template
              </button>
            </>
          )}
        </div>
      </div>

      {/* Imported data preview */}
      {importedData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Imported Subjects Preview
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveImport}
                  disabled={isSaving || importedData.length === 0}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Save All
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject Name
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {importedData.map((mapel, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {mapel.mapel}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                          onClick={() => {
                            // Open edit modal or navigate to edit page
                            // For now, just log
                            console.log("Edit subject", mapel)
                            // You can implement inline editing here
                          }}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                          onClick={() => handleDeleteClick(mapel, index)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <span className="font-medium">{importedData.length}</span>{" "}
              subjects will be imported
            </div>
          </div>
        </div>
      )}

      <DeleteMapelModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setMapelToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        mapel={mapelToDelete}
      />
    </div>
  )
}
