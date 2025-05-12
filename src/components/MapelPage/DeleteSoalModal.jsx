"use client"

export default function DeleteSoalModal({ isOpen, onClose, onConfirm, soal }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>

        {soal && (
          <div className="mb-6">
            <p className="text-gray-700">Are you sure you want to delete the following question?</p>
            <div className="mt-4 p-4 bg-gray-50 rounded-md max-h-40 overflow-auto">
              <p dangerouslySetInnerHTML={{ __html: soal.soal }} />
            </div>
            <p className="mt-4 text-red-600 text-sm">This action cannot be undone.</p>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
