import { useState } from "react";

export default function ModuleModal({
  endpoint,
  isOpen,
  onClose,
  onSave,
  kelasOptions = [],
  fields = [],
  detailData = [],
}) {
  const [id_kelas, setid_kelas] = useState(0);
  const [id_mapel, setid_mapel] = useState(detailData.value);
  const [module, setmodule] = useState(0);
  const [module_judul, setmodule_judul] = useState("");
  const [module_deskripsi, setmodule_deskripsi] = useState("");
  const [loading, setLoading] = useState(false);
  // console.log(loading);

  // mapelOptions.map((mapel) => console.log(mapel));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Setloading
    const newData = {
      id_kelas,
      id_mapel,
      module,
      module_judul,
      module_deskripsi,
    };

    const formData = {};

    if (fields.includes("id_kelas")) formData.id_kelas = id_kelas;
    if (fields.includes("id_mapel")) formData.id_mapel = id_mapel;
    if (fields.includes("module")) formData.module = module;
    if (fields.includes("module_judul")) formData.module_judul = module_judul;
    if (fields.includes("module_deskripsi"))
      formData.module_deskripsi = module_deskripsi;

    try {
      const response = await fetch(
        // `${import.meta.env.VITE_API_URL}/genericMapels`,
        `${import.meta.env.VITE_API_URL}/${endpoint}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(formData),
        }
      );
      // console.log("ini form data");
      // console.log(formData);
    } catch (error) {
      console.error("Gagal update:", error);
      // kamu bisa tampilkan error juga di sini
    } finally {
      setLoading(false);
    }

    onSave(newData);
    setid_kelas(0);
    setid_mapel(0);
    setmodule(0);
    setmodule_judul("");
    setmodule_deskripsi("");
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
        <h2 className="text-xl font-bold mb-4">Tambah Module</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* {showField("id_mapel") && detailData && (
            <div>
              <label className="block mb-1">{detailData.title}</label>
              <input
                type="text"
                className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed"
                value={detailData.text} // tampilkan teksnya
                readOnly
              />
              <input type="hidden" value={detailData.value} />
            </div>
          )} */}

          {showField("id_mapel") && (
            <div>
              {console.log("ini detail data")}
              {console.log(detailData)}
              <label className="block mb-1">{detailData.title}</label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={detailData.text}
                required
                readOnly
              />
            </div>
          )}

          {showField("id_kelas") && (
            <div>
              <label className="block mb-1">Kelas</label>
              <select
                className="w-full border p-2 rounded"
                value={id_kelas}
                onChange={(e) => setid_kelas(parseInt(e.target.value))}
                required
              >
                <option value="">Pilih Kelas</option>
                {kelasOptions?.length > 0 &&
                  kelasOptions.map((kelas) => (
                    <option key={kelas.id_kelas} value={kelas.id_kelas}>
                      {kelas.kelas}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {showField("module") && (
            <div>
              <label className="block mb-1">Nomor Module</label>
              <input
                type="number"
                className="w-full border p-2 rounded"
                value={module}
                onChange={(e) => setmodule(parseInt(e.target.value))}
                required
              />
            </div>
          )}

          {showField("module_judul") && (
            <div>
              <label className="block mb-1">Judul Module</label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={module_judul}
                onChange={(e) => setmodule_judul(e.target.value)}
                required
              />
            </div>
          )}

          {showField("module_deskripsi") && (
            <div>
              <label className="block mb-1">Deskripsi Module</label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={module_deskripsi}
                onChange={(e) => setmodule_deskripsi(e.target.value)}
                required
              />
            </div>
          )}

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
