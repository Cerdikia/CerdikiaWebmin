export default function GuruPage() {
  const userData = JSON.parse(localStorage.getItem("user_data"));

  if (!userData || userData.role !== "guru") {
    return <div>Akses ditolak. Halaman ini hanya untuk Guru.</div>;
  }

  return (
    <div>
      <h1>Halaman Guru</h1>
      <p>Selamat datang, {userData.email}!</p>
    </div>
  );
}
