import { useState } from "react";

export default function MapelModal({
  endpoint,
  isOpen,
  onClose,
  onSave,
  fields = [],
}) {
  const [mapel, setMapel] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Setloading
    const newData = { mapel };

    const formData = {};

    if (fields.includes("mapel")) formData.mapel = mapel;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/${endpoint}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(formData),
        }
      );
    } catch (error) {
      console.error("Gagal update:", error);
      // kamu bisa tampilkan error juga di sini
    } finally {
      setLoading(false);
    }

    onSave(newData);
    setMapel("");
    onClose();
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const showField = (fieldName) => fields.includes(fieldName);

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <div
        onClick={handleModalClick}
        className={`bg-white p-6 rounded-lg w-full max-w-md transform transition-all duration-300 ${
          isOpen ? "scale-100" : "scale-95"
        }`}
      >
        <h2 className="text-xl font-bold mb-4">Tambah User Baru</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {showField("mapel") && (
            <div>
              <label className="block mb-1">Mata Pelajaran</label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={mapel}
                onChange={(e) => setMapel(e.target.value)}
                required
              />
            </div>
          )}

          {/* submit button */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500"
              onClick={onClose}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {/* Simpan */}
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
