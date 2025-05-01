export default async function RefreshToken() {
  try {
    const refreshToken = localStorage.getItem("refresh_token"); // ambil refresh_token dari localStorage

    console.log(`ini refresh token : ${refreshToken}`);

    if (!refreshToken) {
      throw new Error("Refresh token tidak ditemukan");
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/refresh`, {
      method: "POST",
      // credentials: "include", // kalau pakai cookie refresh token
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: refreshToken, // kirim refresh_token via body
      }),
    });

    // console.log(response);

    if (!response.ok) {
      throw new Error("Gagal refresh token");
    }

    const data = await response.json();
    // console.log(data);

    // Simpan token baru
    localStorage.setItem("access_token", data.Data.access_token);

    return true;
  } catch (error) {
    console.error("Refresh token error:", error);
    return false;
  }
}
