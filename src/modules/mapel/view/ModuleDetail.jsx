// ${localStorage.getItem("access_token")}
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RefreshToken from "../../../components/_common_/RefreshToken";
import AddUserModal from "/src/components/_common_/Modal";
import FetchData from "../../../components/_common_/FetchData";
// import { RefreshToken } from "/src/components/_common_/RefreshToken";

export default function ModuleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mapel, setMapel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [kelasList, setKelasList] = useState([]);
  const userData = JSON.parse(localStorage.getItem("user_data"));

  // =====================================
  if (id) {
    // Simpan ke Local Storage
    localStorage.setItem("idModule", id);
    console.log("ID idModule disimpan:", id);
  } else {
    console.log("ID idModule tidak ditemukan di URL");
  }

  // Untuk mengambil kembali nilai ID dari localStorage
  const storedId = localStorage.getItem("idModule");
  console.log("ID dari Local Storage:", storedId);
  // ========================================

  if (!userData || userData.role !== "admin") {
    return <div>Akses ditolak. Halaman ini hanya untuk Admin.</div>;
  }

  const handleSaveUser = (userData) => {
    console.log("User baru:", userData);
    // TODO: Kirim ke API di sini
  };

  const getKelas = async () => {
    try {
      const data = await FetchData(localStorage.getItem("access_token"));
      setKelasList(data);
    } catch (err) {
      console.error("Gagal mengambil data kelas:", err);
    }
  };

  const fetchData = async () => {
    try {
      let response = await fetch(
        `${import.meta.env.VITE_API_URL}/genericModules?id_mapel=${id}&finished=0`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      console.log(response);

      if (response.status === 401) {
        // Kalau 401, berarti token expired, refresh token dulu
        let refreshed = await RefreshToken();

        if (refreshed) {
          // Setelah refresh sukses, ulang fetch
          response = await fetch(
            `${import.meta.env.VITE_API_URL}/genericModules?id_mapel=${id}&finished=0`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              },
            }
          );
        } else {
          // Kalau refresh gagal, redirect ke login
          window.location.href = "/login";
          // <Navigate to="/login" replace />;
          return;
        }
      }

      const data = await response.json();
      console.log(data);

      if (data.Data) {
        setMapel(data.Data);
      } else {
        setMapel([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);

      setMapel([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getKelas();
    fetchData();
  }, []);

  if (loading) {
    return <p>Loading data...</p>;
  }

  const handleRowClick = (id) => {
    // router.push(`/detail-mapel/${id}`);
    navigate(`/detail-mapel/${id}`);
    // console.log(id);
  };

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Tambah Mata Pelajaran
      </button>

      {/* <AddUserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveUser}
          mapelOptions={mapelOptions}
        /> */}

      {/* {
"module": 1, => input module manual | ambil dari tabel module WHERE kelas = id kelas
  "id_mapel": 1, => ✅
  "id_kelas": 1, => ambil dari tabel kelas
  "module": 1, => input module manual 
  "module_judul": "Belajar Membaca 2", => input module manual 
  "module_deskripsi": "Untuk kelas 1" => input module manual
} */}

      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        mapelOption={kelasList}
        fields={["mapel", "idMapel"]}
      />
      <h1 className="text-3xl font-semibold mb-4">Daftar User</h1>
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2 text-left">Kelas</th>
            <th className="px-4 py-2 text-left">ID Module</th>
            <th className="px-4 py-2 text-left">Module</th>
            <th className="px-4 py-2 text-left">Judul</th>
            <th className="px-4 py-2 text-left">Keterangan</th>
            <th className="px-4 py-2 text-left">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {mapel.length > 0 ? (
            mapel.map((row, index) => (
              <tr
                key={index}
                className="hover:bg-gray-100 cursor-pointer"
                onClick={() => handleRowClick(row.id_mapel)}
              >
                <td className="px-4 py-2">{row.kelas}</td>
                <td className="px-4 py-2">{row.id_module}</td>
                <td className="px-4 py-2">{row.module}</td>
                <td className="px-4 py-2">{row.module_deskripsi}</td>
                <td className="px-4 py-2">{row.module_judul}</td>
                <td className="px-4 py-2">
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation(); // supaya klik tombol tidak ikut klik baris
                      // Tambahkan logika edit di sini
                    }}
                  >
                    Edit
                  </button>{" "}
                  |
                  <button
                    className="text-red-500 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation(); // supaya klik tombol tidak ikut klik baris
                      // Tambahkan logika hapus di sini
                    }}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="px-4 py-2 text-center">
                Tidak ada data.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
