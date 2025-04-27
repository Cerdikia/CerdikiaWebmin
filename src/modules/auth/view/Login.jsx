import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      console.log(email);
      console.log(role);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          role,
        }),
      });

      if (!response.ok) {
        throw new Error("Login gagal");
      }

      const data = await response.json();

      console.log(data);

      // Simpan token
      // localStorage.setItem("access_token", data.Data.access_token);
      // localStorage.setItem("refresh_token", data.Data.refresh_token);

      // Misal simpan data user dulu, belum ada token
      localStorage.setItem("token", data.Data.access_token);
      localStorage.setItem("refresh_token", data.Data.refresh_token);
      localStorage.setItem("user_data", JSON.stringify(data.Data));

      console.log("berhasil login");

      // Redirect ke halaman utama
      // navigate("/");

      // Redirect ke halaman utama + reload
      navigate("/", { replace: true });
      window.location.reload();
    } catch (error) {
      console.error("Login error:", error);
      alert("Login gagal, cek email dan role!");
    }
  };

  return (
    <div>
      <h1>Login Page</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <select value={role} onChange={(e) => setRole(e.target.value)} required>
          <option value="">-- Role --</option>
          <option value="siswa">Siswa</option>
          <option value="guru">Guru</option>
          <option value="admin">Admin</option>
        </select>
        <br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
