"use client"

import { useParams } from "react-router-dom"
import { useState, useRef, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import ReactQuill from "react-quill"
import Quill from "quill"
import "react-quill/dist/quill.snow.css"
import {
  ArrowLeft,
  Save,
  Loader2,
  HelpCircle,
  ImageIcon,
  Check,
  AlertTriangle,
  FileText,
} from "lucide-react"
// Import and register resize image module
import ResizeImage from "quill-resize-image"
Quill.register("modules/resizeImage", ResizeImage)

export default function UploadSoal() {
  const navigate = useNavigate()
  const { id } = useParams()

  const quillSoalRef = useRef()
  const quillOpsiARef = useRef()
  const quillOpsiBRef = useRef()
  const quillOpsiCRef = useRef()
  const quillOpsiDRef = useRef()

  const [soalContent, setSoalContent] = useState("")
  const [opsiAContent, setOpsiAContent] = useState("")
  const [opsiBContent, setOpsiBContent] = useState("")
  const [opsiCContent, setOpsiCContent] = useState("")
  const [opsiDContent, setOpsiDContent] = useState("")
  const [selectedJawaban, setSelectedJawaban] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const createModules = (editorRef) => ({
    toolbar: {
      container: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        [{ align: [] }, { direction: "rtl" }],
        ["clean"],
      ],
      handlers: {
        image: () => imageHandler(editorRef),
      },
    },
    resizeImage: {
      displaySize: true,
    },
  })

  const modulesSoal = useMemo(() => createModules(quillSoalRef), [])
  const modulesA = useMemo(() => createModules(quillOpsiARef), [])
  const modulesB = useMemo(() => createModules(quillOpsiBRef), [])
  const modulesC = useMemo(() => createModules(quillOpsiCRef), [])
  const modulesD = useMemo(() => createModules(quillOpsiDRef), [])

  const imageHandler = async (editorRef) => {
    const quill = editorRef?.current?.getEditor()
    if (!quill) return

    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.click()

    input.onchange = async () => {
      const file = input.files[0]
      if (!file) return

      // Get the selection range
      const range = quill.getSelection(true)
      const insertIndex = range.index

      // Insert loading image
      quill.insertEmbed(insertIndex, "image", "/img/loading.gif")

      try {
        setIsLoading(true)
        const formData = new FormData()
        formData.append("image", file)

        const response = await fetch(
          `${window.env.VITE_API_URL}/upload-image`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            body: formData,
          },
        )

        const data = await response.json()

        if (data.Data && data.Data.url) {
          // Delete the loading image
          quill.deleteText(insertIndex, 1)

          // Insert the actual image
          quill.insertEmbed(
            range ? range.index : quill.getLength(),
            "image",
            data.Data.url,
          )
        } else {
          // Delete the loading image if upload failed
          quill.deleteText(insertIndex, 1)
          setError("Failed to upload image.")
        }
      } catch (err) {
        console.error("Upload error:", err)
        // Delete the loading image if upload failed
        quill.deleteText(insertIndex, 1)
        setError("Image upload failed.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSubmit = async () => {
    if (
      !soalContent ||
      !opsiAContent ||
      !opsiBContent ||
      !opsiCContent ||
      !opsiDContent ||
      !["a", "b", "c", "d"].includes(selectedJawaban)
    ) {
      setError("Please complete all fields and select an answer.")
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      const response = await fetch(`${window.env.VITE_API_URL}/upload-soal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          id_module: Number.parseInt(id, 10),
          soal: soalContent,
          jenis: "pilihan_ganda",
          opsi_a: opsiAContent,
          opsi_b: opsiBContent,
          opsi_c: opsiCContent,
          opsi_d: opsiDContent,
          jawaban: selectedJawaban,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save question")
      }

      await response.json()

      setSuccess("Question successfully added!")

      // Reset form
      setSoalContent("")
      setOpsiAContent("")
      setOpsiBContent("")
      setOpsiCContent("")
      setOpsiDContent("")
      setSelectedJawaban(null)

      // Redirect after a short delay
      setTimeout(() => {
        navigate(`/list-soal/${id}`)
      }, 1500)
    } catch (err) {
      console.error("Save error:", err)
      setError("Failed to save question. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header with back button and title */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(`/list-soal/${id}`)}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
          aria-label="Back to questions"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Question</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create a new multiple choice question
          </p>
        </div>
      </div>

      {/* Notification messages */}
      {error && (
        <div className="mb-6 p-4 border-l-4 border-red-500 bg-red-50 text-red-700 flex items-start">
          <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 border-l-4 border-green-500 bg-green-50 text-green-700 flex items-start">
          <Check className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{success}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Question Column */}
          <div className="lg:col-span-3">
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <FileText className="w-5 h-5 text-indigo-600 mr-2" />
                <label className="block text-lg font-medium text-gray-700">
                  Question Content
                </label>
              </div>
              <div className="border rounded-lg border-gray-300 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                <ReactQuill
                  ref={quillSoalRef}
                  value={soalContent}
                  onChange={setSoalContent}
                  modules={modulesSoal}
                  placeholder="Write your question here..."
                  className="min-h-[200px]"
                />
              </div>
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <HelpCircle className="w-4 h-4 mr-1" />
                <span>Use the toolbar to format text and add images</span>
              </div>
            </div>
          </div>

          {/* Options Columns */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  name="jawaban"
                  id="jawaban-a"
                  value="a"
                  checked={selectedJawaban === "a"}
                  onChange={(e) => setSelectedJawaban(e.target.value)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label
                  htmlFor="jawaban-a"
                  className="ml-2 block text-sm font-medium text-gray-700"
                >
                  Option A <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="border rounded-lg border-gray-300 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                <ReactQuill
                  ref={quillOpsiARef}
                  value={opsiAContent}
                  onChange={setOpsiAContent}
                  modules={modulesA}
                  placeholder="Option A content..."
                  className="min-h-[150px]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  name="jawaban"
                  id="jawaban-b"
                  value="b"
                  checked={selectedJawaban === "b"}
                  onChange={(e) => setSelectedJawaban(e.target.value)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label
                  htmlFor="jawaban-b"
                  className="ml-2 block text-sm font-medium text-gray-700"
                >
                  Option B <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="border rounded-lg border-gray-300 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                <ReactQuill
                  ref={quillOpsiBRef}
                  value={opsiBContent}
                  onChange={setOpsiBContent}
                  modules={modulesB}
                  placeholder="Option B content..."
                  className="min-h-[150px]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  name="jawaban"
                  id="jawaban-c"
                  value="c"
                  checked={selectedJawaban === "c"}
                  onChange={(e) => setSelectedJawaban(e.target.value)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label
                  htmlFor="jawaban-c"
                  className="ml-2 block text-sm font-medium text-gray-700"
                >
                  Option C <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="border rounded-lg border-gray-300 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                <ReactQuill
                  ref={quillOpsiCRef}
                  value={opsiCContent}
                  onChange={setOpsiCContent}
                  modules={modulesC}
                  placeholder="Option C content..."
                  className="min-h-[150px]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  name="jawaban"
                  id="jawaban-d"
                  value="d"
                  checked={selectedJawaban === "d"}
                  onChange={(e) => setSelectedJawaban(e.target.value)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label
                  htmlFor="jawaban-d"
                  className="ml-2 block text-sm font-medium text-gray-700"
                >
                  Option D <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="border rounded-lg border-gray-300 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                <ReactQuill
                  ref={quillOpsiDRef}
                  value={opsiDContent}
                  onChange={setOpsiDContent}
                  modules={modulesD}
                  placeholder="Option D content..."
                  className="min-h-[150px]"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <HelpCircle className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-indigo-800">
                    Correct Answer
                  </h3>
                  <div className="mt-2 text-sm text-indigo-700">
                    <p>
                      Select the radio button next to the correct option. The
                      selected option will be marked as the correct answer.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center text-sm text-gray-500">
                <ImageIcon className="w-4 h-4 mr-1" />
                <span>
                  Click the image icon in the toolbar to upload images
                </span>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => navigate(`/list-soal/${id}`)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium disabled:bg-indigo-400"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Question
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
