const fetchAllKelas = async (token) => {
  try {
    const response = await fetch("https://your-api-url.com/api/kelas", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Gagal mengambil data kelas:", error);
    throw error;
  }
};

export default fetchAllKelas;
