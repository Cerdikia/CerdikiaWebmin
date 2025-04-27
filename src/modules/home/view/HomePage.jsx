import { useEffect, useState } from "react";
import AddUserModal from "/src/components/_common_/Modal";

export default function HomePage(){
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mapelOptions = [
    { id: "mapel1", nama: "Matematika" },
    { id: "mapel2", nama: "Bahasa Indonesia" },
    { id: "mapel3", nama: "IPA" },
  ];

  const handleSaveUser = (userData) => {
    console.log("User baru:", userData);
    // TODO: Kirim ke API di sini
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/try`, {
        // headers: {
        //   "Authorization": `Bearer ${localStorage.getItem("token")}`
        // }
      });

      const data = await response.json();
      console.log(data);

      if (data.Data) {
        setUsers(data.Data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setUsers([]);
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

  return (
<div>
<button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Tambah User
      </button>

      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        mapelOptions={mapelOptions}
      />

  <h1 className="text-3xl font-semibold mb-4">Daftar User</h1>
  <table className="min-w-full table-auto border-collapse border border-gray-300">
    <thead>
      <tr className="bg-gray-200">
        <th className="px-4 py-2 text-left">Email</th>
        <th className="px-4 py-2 text-left">Role</th>
        <th className="px-4 py-2 text-left">Action</th>
      </tr>
    </thead>
    <tbody>
      {users.length > 0 ? (
        users.map((user, index) => (
          <tr key={index} className="hover:bg-gray-100">
            <td className="px-4 py-2">{user.email}</td>
            <td className="px-4 py-2">{user.role}</td>
            <td className="px-4 py-2">
              <button className="text-blue-500 hover:underline">Edit</button> | 
              <button className="text-red-500 hover:underline">Hapus</button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="3" className="px-4 py-2 text-center">Tidak ada data.</td>
        </tr>
      )}
    </tbody>
  </table>
</div>
  );
}