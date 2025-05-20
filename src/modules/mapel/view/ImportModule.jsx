"use client"

import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  Loader2,
  Check,
  ChevronDown,
  ChevronRight,
  Save,
  Edit,
  HelpCircle,
  X,
  Trash2,
} from "lucide-react"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"

export default function ImportModule() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [parsedData, setParsedData] = useState(null)
  const [expandedModules, setExpandedModules] = useState({})
  const [expandedQuestions, setExpandedQuestions] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [editingOption, setEditingOption] = useState(null)
  const [editedContent, setEditedContent] = useState("")
  const [deleteConfirmation, setDeleteConfirmation] = useState(null)

  // Quill modules and formats configuration
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      ["link", "image"],
      ["clean"],
    ],
  }

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
    "image",
    "color",
    "background",
  ]

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  // Handle file selection
  const handleFileChange = (file) => {
    // Reset states
    setError(null)
    setParsedData(null)
    setSaveSuccess(false)

    // Validate file type
    if (!file.name.endsWith(".xlsx")) {
      setError("Please upload a valid Excel (.xlsx) file")
      setFile(null)
      return
    }

    setFile(file)
  }

  // Handle file upload and parsing
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process file")
      }

      const data = await response.json()
      console.log(data)

      setParsedData(data)

      // Initialize expanded states for modules
      const moduleStates = {}
      data.forEach((subject, subjectIndex) => {
        subject.module.forEach((module, moduleIndex) => {
          moduleStates[`${subjectIndex}-${moduleIndex}`] = false
        })
      })
      setExpandedModules(moduleStates)
    } catch (err) {
      console.error("Upload error:", err)
      setError(err.message || "Failed to upload and process file")
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle module expansion
  const toggleModule = (subjectIndex, moduleIndex) => {
    const key = `${subjectIndex}-${moduleIndex}`
    setExpandedModules((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // Toggle question expansion
  const toggleQuestion = (subjectIndex, moduleIndex, questionIndex) => {
    const key = `${subjectIndex}-${moduleIndex}-${questionIndex}`
    setExpandedQuestions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // Start editing a question or option
  const startEditing = (
    type,
    content,
    subjectIndex,
    moduleIndex,
    questionIndex,
    optionKey = null,
  ) => {
    setEditingQuestion({
      type,
      subjectIndex,
      moduleIndex,
      questionIndex,
      optionKey,
    })
    setEditedContent(content)
  }

  // Save edited content
  const saveEditedContent = () => {
    if (!editingQuestion) return

    const { type, subjectIndex, moduleIndex, questionIndex, optionKey } =
      editingQuestion
    const newData = [...parsedData]

    if (type === "question") {
      newData[subjectIndex].module[moduleIndex].soal[questionIndex].soal =
        editedContent
    } else if (type === "option") {
      newData[subjectIndex].module[moduleIndex].soal[questionIndex][
        `opsi_${optionKey}`
      ] = editedContent
    }

    setParsedData(newData)
    setEditingQuestion(null)
    setEditedContent("")
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingQuestion(null)
    setEditedContent("")
  }

  // Save imported data to the server
  const handleSave = async () => {
    if (!parsedData || parsedData.length === 0) {
      setError("No data to save")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      // Send the data to a new API endpoint for saving
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/save-imported-data`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(parsedData),
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to save imported data")
      }

      // Show success message
      setSaveSuccess(true)

      // Redirect after a short delay
      setTimeout(() => {
        navigate(`/admin-mapel`)
      }, 2000)
      console.log(parsedData)
    } catch (err) {
      // console.error("Save error:", err)
      console.log(err)

      // setError(err.message || "Failed to save imported data")
      setError(`Failed to save imported data, ${err}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle delete confirmation
  const openDeleteConfirmation = (
    type,
    subjectIndex,
    moduleIndex = null,
    questionIndex = null,
  ) => {
    setDeleteConfirmation({
      type,
      subjectIndex,
      moduleIndex,
      questionIndex,
    })
  }

  // Handle delete action
  const handleDelete = () => {
    if (!deleteConfirmation) return

    const { type, subjectIndex, moduleIndex, questionIndex } =
      deleteConfirmation
    const newData = [...parsedData]

    if (type === "subject") {
      // Delete subject
      newData.splice(subjectIndex, 1)
    } else if (type === "module") {
      // Delete module
      newData[subjectIndex].module.splice(moduleIndex, 1)
    } else if (type === "question") {
      // Delete question
      newData[subjectIndex].module[moduleIndex].soal.splice(questionIndex, 1)
    }

    setParsedData(newData)
    setDeleteConfirmation(null)
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header with back button and title */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(`/admin-mapel`)}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
          aria-label="Back to subjects"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import Module</h1>
          <p className="text-gray-500 text-sm mt-1">
            Upload an Excel file to import modules and questions
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 border-l-4 border-red-500 bg-red-50 text-red-700 flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Success message */}
      {saveSuccess && (
        <div className="mb-6 p-4 border-l-4 border-green-500 bg-green-50 text-green-700 flex items-start">
          <Check className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>Modules and questions successfully imported!</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        {/* File upload section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-900">
            Upload Excel File
          </h2>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              isDragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300"
            } transition-colors duration-200`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center">
              <FileSpreadsheet
                className={`w-12 h-12 mb-3 ${file ? "text-indigo-500" : "text-gray-400"}`}
              />

              {file ? (
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <>
                  <p className="mb-2 text-sm font-medium text-gray-900">
                    Drag and drop your Excel file here
                  </p>
                  <p className="mb-4 text-xs text-gray-500">
                    or click to browse files (XLSX only)
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium text-sm flex items-center"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Browse Files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0])
                      }
                    }}
                  />
                </>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload & Parse
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quill Editor for editing content */}
        {editingQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingQuestion.type === "question"
                    ? "Edit Question"
                    : "Edit Option"}
                </h3>
                <button
                  onClick={cancelEditing}
                  className="p-1 rounded-full hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 flex-grow overflow-auto">
                <ReactQuill
                  theme="snow"
                  value={editedContent}
                  onChange={setEditedContent}
                  modules={quillModules}
                  formats={quillFormats}
                  className="h-[50vh]"
                />
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditedContent}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Data preview section */}
        {parsedData && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Preview & Edit Imported Data
              </h2>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {parsedData.map((subject, subjectIndex) => (
                <div
                  key={`subject-${subjectIndex}`}
                  className="border-b border-gray-200 last:border-b-0"
                >
                  <div className="bg-gray-50 p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {subject.mapel} - Class {subject.kelas}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {subject.module.length} module(s),{" "}
                          {subject.module.reduce(
                            (acc, module) => acc + module.soal.length,
                            0,
                          )}{" "}
                          question(s)
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          openDeleteConfirmation("subject", subjectIndex)
                        }
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                        aria-label="Delete subject"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {subject.module.map((module, moduleIndex) => (
                      <div
                        key={`module-${subjectIndex}-${moduleIndex}`}
                        className="bg-white"
                      >
                        <div
                          className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                          onClick={() =>
                            toggleModule(subjectIndex, moduleIndex)
                          }
                        >
                          <div>
                            <h4 className="font-medium text-gray-800">
                              {module.judul_module}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {module.soal.length} question(s)
                            </p>
                          </div>
                          <div className="flex items-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                openDeleteConfirmation(
                                  "module",
                                  subjectIndex,
                                  moduleIndex,
                                )
                              }}
                              className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 mr-2"
                              aria-label="Delete module"
                            >
                              <Trash2 size={16} />
                            </button>

                            {expandedModules[
                              `${subjectIndex}-${moduleIndex}`
                            ] ? (
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                        </div>

                        {expandedModules[`${subjectIndex}-${moduleIndex}`] && (
                          <div className="px-4 pb-4">
                            <div className="text-sm text-gray-700 mb-3">
                              <span className="font-medium">Description:</span>{" "}
                              {module.deskripsi_module}
                            </div>

                            <div className="border border-gray-200 rounded-md overflow-hidden">
                              {module.soal.map((question, questionIndex) => (
                                <div
                                  key={`question-${subjectIndex}-${moduleIndex}-${questionIndex}`}
                                  className="border-b border-gray-200 last:border-b-0"
                                >
                                  <div
                                    className="p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                                    onClick={() =>
                                      toggleQuestion(
                                        subjectIndex,
                                        moduleIndex,
                                        questionIndex,
                                      )
                                    }
                                  >
                                    <div className="flex items-center">
                                      <span className="text-xs font-medium bg-gray-200 text-gray-800 px-2 py-1 rounded mr-2">
                                        Q{questionIndex + 1}
                                      </span>
                                      <div className="text-sm text-gray-800 line-clamp-1">
                                        {question.soal.replace(/<[^>]*>/g, "")}
                                      </div>
                                    </div>
                                    <div className="flex items-center">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          startEditing(
                                            "question",
                                            question.soal,
                                            subjectIndex,
                                            moduleIndex,
                                            questionIndex,
                                          )
                                        }}
                                        className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full mr-2"
                                        aria-label="Edit question"
                                      >
                                        <Edit size={16} />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          openDeleteConfirmation(
                                            "question",
                                            subjectIndex,
                                            moduleIndex,
                                            questionIndex,
                                          )
                                        }}
                                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 mr-2"
                                        aria-label="Delete question"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                      {expandedQuestions[
                                        `${subjectIndex}-${moduleIndex}-${questionIndex}`
                                      ] ? (
                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-gray-500" />
                                      )}
                                    </div>
                                  </div>

                                  {expandedQuestions[
                                    `${subjectIndex}-${moduleIndex}-${questionIndex}`
                                  ] && (
                                    <div className="p-3 bg-white text-sm">
                                      <div className="mb-3">
                                        <div className="font-medium text-gray-700 mb-1 flex justify-between items-center">
                                          <span>Question:</span>
                                        </div>
                                        <div
                                          className="pl-3 border-l-2 border-gray-200 quill-content"
                                          dangerouslySetInnerHTML={{
                                            __html: question.soal,
                                          }}
                                        />
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                        <div>
                                          <div className="font-medium text-gray-700 mb-1 flex items-center justify-between">
                                            <div className="flex items-center">
                                              <span
                                                className={`mr-2 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                                                  question.jawaban === "a"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-800"
                                                }`}
                                              >
                                                A
                                              </span>
                                              Option A:
                                            </div>
                                            <button
                                              onClick={() =>
                                                startEditing(
                                                  "option",
                                                  question.opsi_a,
                                                  subjectIndex,
                                                  moduleIndex,
                                                  questionIndex,
                                                  "a",
                                                )
                                              }
                                              className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full"
                                              aria-label="Edit option A"
                                            >
                                              <Edit size={14} />
                                            </button>
                                          </div>
                                          <div
                                            className="pl-3 border-l-2 border-gray-200 quill-content"
                                            dangerouslySetInnerHTML={{
                                              __html: question.opsi_a,
                                            }}
                                          />
                                        </div>

                                        <div>
                                          <div className="font-medium text-gray-700 mb-1 flex items-center justify-between">
                                            <div className="flex items-center">
                                              <span
                                                className={`mr-2 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                                                  question.jawaban === "b"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-800"
                                                }`}
                                              >
                                                B
                                              </span>
                                              Option B:
                                            </div>
                                            <button
                                              onClick={() =>
                                                startEditing(
                                                  "option",
                                                  question.opsi_b,
                                                  subjectIndex,
                                                  moduleIndex,
                                                  questionIndex,
                                                  "b",
                                                )
                                              }
                                              className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full"
                                              aria-label="Edit option B"
                                            >
                                              <Edit size={14} />
                                            </button>
                                          </div>
                                          <div
                                            className="pl-3 border-l-2 border-gray-200 quill-content"
                                            dangerouslySetInnerHTML={{
                                              __html: question.opsi_b,
                                            }}
                                          />
                                        </div>

                                        <div>
                                          <div className="font-medium text-gray-700 mb-1 flex items-center justify-between">
                                            <div className="flex items-center">
                                              <span
                                                className={`mr-2 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                                                  question.jawaban === "c"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-800"
                                                }`}
                                              >
                                                C
                                              </span>
                                              Option C:
                                            </div>
                                            <button
                                              onClick={() =>
                                                startEditing(
                                                  "option",
                                                  question.opsi_c,
                                                  subjectIndex,
                                                  moduleIndex,
                                                  questionIndex,
                                                  "c",
                                                )
                                              }
                                              className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full"
                                              aria-label="Edit option C"
                                            >
                                              <Edit size={14} />
                                            </button>
                                          </div>
                                          <div
                                            className="pl-3 border-l-2 border-gray-200 quill-content"
                                            dangerouslySetInnerHTML={{
                                              __html: question.opsi_c,
                                            }}
                                          />
                                        </div>

                                        <div>
                                          <div className="font-medium text-gray-700 mb-1 flex items-center justify-between">
                                            <div className="flex items-center">
                                              <span
                                                className={`mr-2 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                                                  question.jawaban === "d"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-800"
                                                }`}
                                              >
                                                D
                                              </span>
                                              Option D:
                                            </div>
                                            <button
                                              onClick={() =>
                                                startEditing(
                                                  "option",
                                                  question.opsi_d,
                                                  subjectIndex,
                                                  moduleIndex,
                                                  questionIndex,
                                                  "d",
                                                )
                                              }
                                              className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full"
                                              aria-label="Edit option D"
                                            >
                                              <Edit size={14} />
                                            </button>
                                          </div>
                                          <div
                                            className="pl-3 border-l-2 border-gray-200 quill-content"
                                            dangerouslySetInnerHTML={{
                                              __html: question.opsi_d,
                                            }}
                                          />
                                        </div>
                                      </div>

                                      <div className="text-xs text-gray-500 flex items-center">
                                        <span className="font-medium mr-1">
                                          Correct Answer:
                                        </span>
                                        <span className="uppercase">
                                          {question.jawaban}
                                        </span>
                                        <span className="mx-2">•</span>
                                        <span className="font-medium mr-1">
                                          Type:
                                        </span>
                                        {question.jenis === "PG"
                                          ? "Multiple Choice"
                                          : question.jenis}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Help box */}
            <div className="mt-6 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <HelpCircle className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-indigo-800">
                    Editing Instructions
                  </h3>
                  <div className="mt-2 text-sm text-indigo-700">
                    <p className="mb-1">
                      You can edit questions and options by clicking the edit
                      icon:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Click the edit button next to any question or option
                      </li>
                      <li>Use the rich text editor to make changes</li>
                      <li>Save your changes when done</li>
                      <li>All HTML content will be properly preserved</li>
                    </ul>
                    <p className="mt-2 mb-1">
                      You can also delete items by clicking the trash icon:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Delete subjects, modules, or individual questions</li>
                      <li>A confirmation dialog will appear before deletion</li>
                      <li>Deletions cannot be undone after saving</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate(`/admin-mapel`)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !parsedData || parsedData.length === 0}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Imported Data
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Deletion
              </h3>
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="p-1 rounded-full hover:bg-gray-100"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-2 rounded-full mr-3">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-gray-800 font-medium">
                  {deleteConfirmation.type === "subject"
                    ? "Are you sure you want to delete this subject?"
                    : deleteConfirmation.type === "module"
                      ? "Are you sure you want to delete this module?"
                      : "Are you sure you want to delete this question?"}
                </p>
              </div>
              <p className="text-gray-600 mb-4">
                {deleteConfirmation.type === "subject"
                  ? "This will delete the subject and all its modules and questions. This action cannot be undone."
                  : deleteConfirmation.type === "module"
                    ? "This will delete the module and all its questions. This action cannot be undone."
                    : "This action cannot be undone."}
              </p>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for Quill content */}
      <style jsx global>{`
        .quill-content img {
          max-width: 100%;
          height: auto;
        }

        .quill-content p {
          margin-bottom: 0.5rem;
        }

        .quill-content ul,
        .quill-content ol {
          margin-left: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .quill-content h1,
        .quill-content h2,
        .quill-content h3,
        .quill-content h4,
        .quill-content h5,
        .quill-content h6 {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .ql-editor {
          min-height: 200px;
        }
      `}</style>
    </div>
  )
}
