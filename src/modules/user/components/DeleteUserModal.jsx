"use client"

import { AlertTriangle } from "lucide-react"

export default function DeleteUserModal({ isOpen, onClose, onConfirm, user }) {
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

        {user && (
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center mb-3">
                <img
                  src={user.image_profile || "/img/default_user.png"}
                  alt={user.nama}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="font-medium text-gray-900">{user.nama || "No Name"}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <p>
                  <span className="font-medium">Role:</span> {user.role}
                </p>
                {user.date_created && (
                  <p>
                    <span className="font-medium">Created:</span> {new Date(user.date_created).toLocaleDateString()}
                  </p>
                )}
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
            Delete User
          </button>
        </div>
      </div>
    </div>
  )
}
