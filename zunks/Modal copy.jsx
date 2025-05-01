import { useState } from "react";

export default function AddUserModal({
  isOpen,
  onClose,
  onSave,
  mapelOptions,
}) {
  const [email, setEmail] = useState("");
  const [idMapel, setIdMapel] = useState("");
  const [nama, setNama] = useState("");
  const [jabatan, setJabatan] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const newUser = { email, idMapel, nama, jabatan };
    onSave(newUser);
    setEmail("");
    setIdMapel("");
    setNama("");
    setJabatan("");
    onClose();
  };

  // Untuk stop klik di dalam modal agar tidak nutup
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      onClick={onClose} // klik luar modal = tutup
      className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <div
        onClick={handleModalClick} // klik di modal tidak nutup
        className={`bg-white p-6 rounded-lg w-full max-w-md transform transition-all duration-300 ${
          isOpen ? "scale-100" : "scale-95"
        }`}
      >
        <h2 className="text-xl font-bold mb-4">Tambah User Baru</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1">ID Mapel</label>
            <select
              className="w-full border p-2 rounded"
              value={idMapel}
              onChange={(e) => setIdMapel(e.target.value)}
              required
            >
              <option value="">Pilih Mapel</option>
              {mapelOptions.map((mapel) => (
                <option key={mapel.id} value={mapel.id}>
                  {mapel.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">Nama</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1">Jabatan</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={jabatan}
              onChange={(e) => setJabatan(e.target.value)}
              required
            />
          </div>

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
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
