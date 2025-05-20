import { useState } from "react";

export default function AddUserModal({
  endpoint,
  isOpen,
  onClose,
  onSave,
  mapelOptions = [],
  kelasOptions = [],
  fields = [],
  detailData = [],
}) {
  const [email, setEmail] = useState("");
  const [idMapel, setIdMapel] = useState("");
  const [nama, setNama] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [mapel, setMapel] = useState("");
  const [loading, setLoading] = useState(false);
  // const [kelasOptions, setKelasOptions] = useState([]);
  const [idKelas, setIdKelas] = useState("");
  const [detail, setDetail] = useState("");
  // console.log(loading);

  mapelOptions.map((mapel) => console.log(mapel));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Setloading
    const newData = { email, idMapel, nama, jabatan, mapel, idKelas, detail };

    const formData = {};

    if (fields.includes("email")) formData.email = email;
    if (fields.includes("nama")) formData.nama = nama;
    if (fields.includes("jabatan")) formData.jabatan = jabatan;
    if (fields.includes("mapel")) formData.id_mapel = mapel;
    if (fields.includes("idMapel")) formData.idMapel = idMapel;
    if (fields.includes("Kelas")) formData.idKelas = idMapel;
    if (fields.includes("Detail")) formData.detail = idMapel;

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

      // onSave(newData);
      // setEmail("");
      // setIdMapel("");
      // setNama("");
      // setJabatan("");
      // setMapel("");
      // onClose();
    }

    onSave(newData);
    setEmail("");
    setIdMapel("");
    setNama("");
    setJabatan("");
    setMapel("");
    setIdKelas("");
    setDetail("");
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
          {showField("email") && (
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
          )}

          {showField("Detail") && (
            <div>
              <label className="block mb-1">{detailData.title}</label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={detailData.text}
                onChange={() => setDetail(detailData.value)}
                required
                readOnly
              />
            </div>
          )}

          {showField("idMapel") && (
            <div>
              <label className="block mb-1">ID Mapel</label>
              <select
                className="w-full border p-2 rounded"
                value={idMapel}
                onChange={(e) => setIdMapel(e.target.value)}
                required
              >
                <option value="">Pilih Mapel</option>
                {mapelOptions?.length > 0 &&
                  mapelOptions.map((mapel) => (
                    <option key={mapel.id} value={mapel.id}>
                      {mapel.nama}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {showField("Kelas") && (
            <div>
              <label className="block mb-1">Kelas</label>
              <select
                className="w-full border p-2 rounded"
                value={idKelas}
                onChange={(e) => setIdKelas(e.target.value)}
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

          {/* {showField("nama") && (
            <div>
              <label className="block mb-1">Nama</label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={TextDetail}
                onChange={(e) => setNama(e.target.value)}
                required
              />
            </div>
          )} */}

          {showField("jabatan") && (
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
          )}

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
