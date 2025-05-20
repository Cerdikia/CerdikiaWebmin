"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
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
import DeleteSoalModal from "../../../components/MapelPage/DeleteSoalModal"

export default function ImportSoal() {
  const navigate = useNavigate()
  const { id } = useParams() // module id
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [importedData, setImportedData] = useState([])
  const [moduleDetail, setModuleDetail] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [soalToDelete, setSoalToDelete] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    // Fetch module details
    fetchModuleDetail()
  }, [id])

  const fetchModuleDetail = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/genericModule/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      )

      if (response.ok) {
        const data = await response.json()
        if (data.Data) {
          setModuleDetail(data.Data)
        }
      }
    } catch (err) {
      console.error("Error fetching module details:", err)
    }
  }

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
        const requiredHeaders = [
          "soal",
          "jenis",
          "opsi_a",
          "opsi_b",
          "opsi_c",
          "opsi_d",
          "jawaban",
        ]
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
          if (!rowData.soal) {
            errors.push(`Row ${i + 1}: Question text is required`)
            continue
          }

          if (
            !rowData.jenis ||
            !["pilihan_ganda", "essay"].includes(rowData.jenis)
          ) {
            errors.push(
              `Row ${i + 1}: Question type must be "pilihan_ganda" or "essay"`,
            )
            continue
          }

          if (rowData.jenis === "pilihan_ganda") {
            // For multiple choice, validate options and answer
            if (
              !rowData.opsi_a ||
              !rowData.opsi_b ||
              !rowData.opsi_c ||
              !rowData.opsi_d
            ) {
              errors.push(
                `Row ${i + 1}: All options (A, B, C, D) are required for multiple choice questions`,
              )
              continue
            }

            if (
              !rowData.jawaban ||
              !["a", "b", "c", "d", "A", "B", "C", "D"].includes(
                rowData.jawaban,
              )
            ) {
              errors.push(`Row ${i + 1}: Answer must be one of: a, b, c, d`)
              continue
            }

            // Normalize answer to lowercase
            rowData.jawaban = rowData.jawaban.toLowerCase()
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
            "No valid questions found in the Excel file after validation.",
          )
        } else {
          setImportedData(processedData)
          setSuccess(
            `Successfully processed ${processedData.length} questions from Excel file.`,
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
    const headers = [
      "soal",
      "jenis",
      "opsi_a",
      "opsi_b",
      "opsi_c",
      "opsi_d",
      "jawaban",
    ]

    // Add example data
    const exampleData = [
      headers,
      [
        "Apa ibu kota Indonesia?",
        "pilihan_ganda",
        "Jakarta",
        "Surabaya",
        "Bandung",
        "Medan",
        "a",
      ],
      [
        "Jelaskan proses fotosintesis secara singkat.",
        "essay",
        "",
        "",
        "",
        "",
        "",
      ],
    ]

    const ws = XLSX.utils.aoa_to_sheet(exampleData)
    XLSX.utils.book_append_sheet(wb, ws, "Template")

    // Generate and download the file
    XLSX.writeFile(wb, "soal_template.xlsx")
  }

  const handleDeleteClick = (soal, index) => {
    setSoalToDelete({ ...soal, index })
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!soalToDelete) return

    // Remove the question from importedData
    const updatedData = [...importedData]
    updatedData.splice(soalToDelete.index, 1)
    setImportedData(updatedData)

    setIsDeleteModalOpen(false)
    setSoalToDelete(null)
    setSuccess("Question removed from import list.")

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
        setError("No questions to save. Please import questions first.")
        setIsSaving(false)
        return
      }

      // Prepare data for API
      const importData = {
        id_module: Number(id),
        questions: importedData.map((soal) => ({
          soal: soal.soal,
          jenis: soal.jenis,
          opsi_a: soal.opsi_a,
          opsi_b: soal.opsi_b,
          opsi_c: soal.opsi_c,
          opsi_d: soal.opsi_d,
          jawaban: soal.jawaban,
        })),
      }

      // Call API to save questions
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/bulk-upload-soal`,
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
        throw new Error("Failed to save imported questions")
      }

      const result = await response.json()

      if (result.Message === "Success") {
        setSuccess("Questions imported successfully!")

        // Redirect after a short delay
        setTimeout(() => {
          navigate(`/list-soal/${id}`)
        }, 1500)
      } else {
        setError(
          "Failed to import questions: " + (result.Message || "Unknown error"),
        )
      }
    } catch (err) {
      console.error("Import error:", err)
      setError(
        "An error occurred while saving the imported questions: " + err.message,
      )
    } finally {
      setIsSaving(false)
    }
  }

  // Function to truncate HTML content for display
  const truncateHtml = (html, maxLength = 100) => {
    if (!html) return ""
    const plainText = html.replace(/<[^>]*>/g, "")
    if (plainText.length <= maxLength) return plainText
    return plainText.substring(0, maxLength) + "..."
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
            Import Questions from Excel
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {moduleDetail
              ? `Module: ${moduleDetail.module_judul}`
              : "Upload an Excel file with questions"}
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
                Imported Questions Preview
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
                    Question
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Answer
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {importedData.map((soal, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="ml-4 max-w-md">
                          <div className="text-sm text-gray-900 line-clamp-2">
                            {truncateHtml(soal.soal)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          soal.jenis === "pilihan_ganda"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {soal.jenis === "pilihan_ganda"
                          ? "Multiple Choice"
                          : "Essay"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {soal.jenis === "pilihan_ganda" && (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                          Option {soal.jawaban.toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                          onClick={() => {
                            // Open edit modal or navigate to edit page
                            // For now, just log
                            console.log("Edit question", soal)
                            // You can implement inline editing here
                          }}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                          onClick={() => handleDeleteClick(soal, index)}
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
              questions will be imported
            </div>
          </div>
        </div>
      )}

      <DeleteSoalModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSoalToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        soal={soalToDelete}
      />
    </div>
  )
}
