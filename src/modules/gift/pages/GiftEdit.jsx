"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Save, Diamond } from "lucide-react"
import { FilePond, registerPlugin } from "react-filepond"
import FilePondPluginImagePreview from "filepond-plugin-image-preview"
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type"
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation"
import "filepond/dist/filepond.min.css"
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css"
import RefreshToken from "../../../components/_common_/RefreshToken"
import Notification from "../components/Notification"

// Register FilePond plugins
registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType,
  FilePondPluginImageExifOrientation,
)

export default function GiftEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    quantity: 1,
    diamond_value: 0,
    description: "",
  })
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState(null)
  const [originalGift, setOriginalGift] = useState(null)
  const userData = JSON.parse(localStorage.getItem("user_data"))
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (userData && userData.role === "admin") {
      setIsAdmin(true)
    } else {
      setIsAdmin(false)
    }
  }, [userData])

  // Fetch gift data
  useEffect(() => {
    const fetchGiftData = async () => {
      try {
        setFetchLoading(true)
        let response = await fetch(`${window.env.VITE_API_URL}/gifts/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        })

        if (response.status === 401) {
          const refreshed = await RefreshToken()
          if (refreshed) {
            response = await fetch(`${window.env.VITE_API_URL}/gifts/${id}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              },
            })
          } else {
            navigate("/login", { replace: true })
            return
          }
        }

        const data = await response.json()

        if (data.Data) {
          const gift = data.Data
          setOriginalGift(gift)
          setFormData({
            name: gift.nama_barang || "",
            quantity: gift.jumlah || 1,
            diamond_value: gift.diamond || 0,
            description: gift.description || "",
          })

          // Set image preview if available
          if (gift.img) {
            // We don't set files here because FilePond expects a File object
            // Instead, we'll show the image in a preview element
          }
        } else {
          setError("Gift not found")
        }
      } catch (error) {
        console.error("Error fetching gift:", error)
        setError("Failed to fetch gift data. Please try again.")
      } finally {
        setFetchLoading(false)
      }
    }

    if (id) {
      fetchGiftData()
    }
  }, [id, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "diamond_value"
          ? Number.parseInt(value) || 0
          : value,
    }))
  }

  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target.result
        img.onload = () => {
          const canvas = document.createElement("canvas")
          canvas.width = 86
          canvas.height = 86
          const ctx = canvas.getContext("2d")
          ctx.drawImage(img, 0, 0, 86, 86)

          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error("Canvas to Blob conversion failed"))
              return
            }
            // Create a new file from the blob with the same name
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })
            resolve(resizedFile)
          }, file.type)
        }
        img.onerror = (error) => {
          reject(error)
        }
      }
      reader.onerror = (error) => {
        reject(error)
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setNotification(null)

    try {
      // Create form data for the API request
      const apiFormData = new FormData()
      apiFormData.append("nama_barang", formData.name)
      apiFormData.append("jumlah", formData.quantity)
      apiFormData.append("diamond", formData.diamond_value)
      apiFormData.append("description", formData.description)

      // Append the image file if a new one was selected
      if (files.length > 0) {
        // Resize the image before uploading
        const resizedImage = await resizeImage(files[0].file)
        apiFormData.append("image", resizedImage)
      }

      // Make the API request
      // console.log("API hit", `${window.env.VITE_API_URL}/gifts/${id}`)

      let response = await fetch(`${window.env.VITE_API_URL}/gifts/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: apiFormData,
      })

      if (response.status === 401) {
        const refreshed = await RefreshToken()
        if (refreshed) {
          response = await fetch(`${window.env.VITE_API_URL}/gifts/${id}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            body: apiFormData,
          })
        } else {
          navigate("/login", { replace: true })
          return
        }
      }

      const data = await response.json()

      if (response.ok) {
        setNotification({
          type: "success",
          message: "Gift successfully updated!",
        })

        // Redirect after a short delay
        setTimeout(() => {
          navigate("/gifts")
        }, 2000)
      } else {
        throw new Error(data.message || "Failed to update gift")
      }
    } catch (error) {
      console.error("Error updating gift:", error)
      setError(error.message || "An error occurred while updating the gift")
      setNotification({
        type: "error",
        message: error.message || "Failed to update gift",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="p-8 bg-red-50 rounded-xl border border-red-200">
        <h2 className="text-xl font-semibold text-red-700">Access Denied</h2>
        <p className="mt-2 text-red-600">
          This page is only accessible to administrators.
        </p>
      </div>
    )
  }

  if (fetchLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error && !originalGift) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => navigate("/gifts")}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Gifts
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/gifts")}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Edit Gift</h1>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Gift Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter gift name"
              />
            </div>

            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="diamond_value"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Diamond Value <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Diamond
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500"
                />
                <input
                  type="number"
                  id="diamond_value"
                  name="diamond_value"
                  value={formData.diamond_value}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter gift description (optional)"
              ></textarea>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gift Image
            </label>

            {/* Current image preview */}
            {originalGift && originalGift.img && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Current Image:</p>
                <div className="w-40 h-40 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                  <img
                    src={
                      originalGift.img.startsWith("http")
                        ? originalGift.img
                        : `http://${originalGift.img}`
                    }
                    alt={originalGift.nama_barang}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <FilePond
              files={files}
              onupdatefiles={setFiles}
              allowMultiple={false}
              maxFiles={1}
              name="image"
              labelIdle='Drag & Drop a new image or <span class="filepond--label-action">Browse</span>'
              acceptedFileTypes={[
                "image/png",
                "image/jpeg",
                "image/jpg",
                "image/gif",
              ]}
              stylePanelLayout="compact"
              imagePreviewHeight={200}
              imageCropAspectRatio="1:1"
              imageResizeTargetWidth={200}
              imageResizeTargetHeight={200}
              className="gift-upload-filepond"
            />
            <p className="text-xs text-gray-500 mt-1">
              {files.length > 0
                ? "New image will replace the current one and be resized to 86x86 pixels."
                : "Leave empty to keep the current image. Supported formats: JPG, PNG, GIF. Max file size: 5MB."}
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/gifts")}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {loading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Update Gift
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
