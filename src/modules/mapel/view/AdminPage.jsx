import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RefreshToken from "../../../components/_common_/RefreshToken";
import MapelModal from "../../../components/MapelPage/MapelModal";
// import { RefreshToken } from "/src/components/_common_/RefreshToken";

export default function AdminPage() {
  const currentUrl = window.location.href;
  const navigate = useNavigate();
  const [mapel, setMapel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userData = JSON.parse(localStorage.getItem("user_data"));
  // console.log(userData);

  if (!userData || userData.role !== "admin") {
    return <div>Akses ditolak. Halaman ini hanya untuk Admin.</div>;
  }

  const handleSaveUser = (userData) => {
    console.log("User baru:", userData);
    fetchData();
    // TODO: Kirim ke API di sini
  };

  const fetchData = async () => {
    try {
      // const response = await fetch(`${import.meta.env.VITE_API_URL}/genericAllMapels?page=1&limit=10`, {
      let response = await fetch(
        `${import.meta.env.VITE_API_URL}/genericAllMapels`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (response.status === 401) {
        // Kalau 401, berarti token expired, refresh token dulu
        let refreshed = await RefreshToken();

        if (refreshed) {
          // Setelah refresh sukses, ulang fetch
          response = await fetch(
            `${import.meta.env.VITE_API_URL}/genericAllMapels`,
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
    fetchData();
  }, []);

  if (loading) {
    return <p>Loading data...</p>;
  }

  const handleRowClick = (id) => {
    // router.push(`/detail-mapel/${id}`);
    navigate(`/list-module/${id}`);
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

      <MapelModal
        endpoint={"genericMapels"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        fields={["mapel"]}
      />
      {console.log(currentUrl)}
      <h1 className="text-3xl font-semibold mb-4">Daftar User</h1>
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Soal</th>
            <th className="px-4 py-2 text-left">Action</th>
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
                <td className="px-4 py-2">{row.id_mapel}</td>
                <td className="px-4 py-2">{row.mapel}</td>
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
