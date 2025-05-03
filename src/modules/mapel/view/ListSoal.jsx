import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function SoalTable() {
  const { id } = useParams();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [soalList, setSoalList] = useState([]);

  useEffect(() => {
    const apiUrl = `${import.meta.env.VITE_API_URL}/genericSoal/${id}`;
    // const apiUrl = `https://kp-golang-mysql2-container.raffimrg.my.id/genericSoal/10`;

    fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("masuk kondisi 1");

        console.log(data);

        if (data.Message === "Success" && Array.isArray(data.Data)) {
          setSoalList(data.Data);
        } else if (data.Message === "no data found, maybe wrong in query") {
        } else {
          alert("Gagal memuat data.");
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        alert("Terjadi kesalahan saat mengambil data.");
      });
  }, [id]);

  const handleRowClick = (id_soal) => {
    navigate(`/edit-soal/${id_soal}/${id}`);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <a
          href={`/upload-soal/${id}`}
          className="text-blue-600 hover:underline"
        >
          Tambah Soal
        </a>
      </div>

      <h1 className="text-2xl font-bold mb-4">Daftar Soal</h1>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">ID Soal</th>
            <th className="border p-2">Soal</th>
            <th className="border p-2">Jenis</th>
            <th className="border p-2">Opsi A</th>
            <th className="border p-2">Opsi B</th>
            <th className="border p-2">Opsi C</th>
            <th className="border p-2">Opsi D</th>
            <th className="border p-2">Jawaban</th>
          </tr>
        </thead>
        <tbody>
          {soalList.map((soal) => (
            <tr
              key={soal.id_soal}
              className="hover:bg-gray-100 cursor-pointer"
              onClick={() => handleRowClick(soal.id_soal)}
            >
              <td className="border p-2">{soal.id_soal}</td>
              <td
                className="border p-2"
                dangerouslySetInnerHTML={{ __html: soal.soal }}
              />
              <td className="border p-2">{soal.jenis}</td>
              <td
                className="border p-2"
                dangerouslySetInnerHTML={{ __html: soal.opsi_a }}
              />
              <td
                className="border p-2"
                dangerouslySetInnerHTML={{ __html: soal.opsi_b }}
              />
              <td
                className="border p-2"
                dangerouslySetInnerHTML={{ __html: soal.opsi_c }}
              />
              <td
                className="border p-2"
                dangerouslySetInnerHTML={{ __html: soal.opsi_d }}
              />
              <td className="border p-2">{soal.jawaban.toUpperCase()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
