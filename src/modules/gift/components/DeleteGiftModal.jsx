"use client"

import { AlertTriangle } from "lucide-react"

export default function DeleteGiftModal({ isOpen, onClose, onConfirm, gift }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Confirm Deletion</h2>
        </div>

        {gift && (
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this gift? This action cannot be
              undone.
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center mb-3">
                <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100 mr-3">
                  <img
                    src={
                      gift.img
                        ? gift.img.startsWith("http")
                          ? gift.img
                          : `http://${gift.img}`
                        : "/placeholder.svg?height=48&width=48"
                    }
                    alt={gift.nama_barang}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {gift.nama_barang}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2">Quantity: {gift.jumlah}</span>
                    <span>Diamond: {gift.diamond}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            Delete Gift
          </button>
        </div>
      </div>
    </div>
  )
}
