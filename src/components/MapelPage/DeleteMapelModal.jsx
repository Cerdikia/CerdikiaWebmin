"use client"

export default function DeleteMapelModal({ isOpen, onClose, onConfirm, mapel }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Konfirmasi Penghapusan</h2>

        {mapel && (
          <div className="mb-6">
            <p className="text-gray-700">Apakah Anda yakin ingin menghapus mata pelajaran berikut?</p>
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <p>
                <span className="font-medium">ID:</span> {mapel.id_mapel}
              </p>
              <p>
                <span className="font-medium">Mata Pelajaran:</span> {mapel.mapel}
              </p>
            </div>
            <p className="mt-4 text-red-600 text-sm">Tindakan ini tidak dapat dibatalkan.</p>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Batal
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            Hapus
          </button>
        </div>
      </div>
    </div>
  )
}
