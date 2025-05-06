import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { auth } from "../../../firebase-config";

// Inisialisasi Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account", // Paksa Google untuk menampilkan pilihan akun
});

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Tangani hasil login setelah redirect
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          const userEmail = result.user.email;
          setEmail(userEmail);
        }
      })
      .catch((error) => {
        console.error("Redirect login error:", error);
        alert("Login gagal: " + error.message);
      });
  }, []);

  useEffect(() => {
    if (email) {
      console.log("Email berhasil diset:", email);
    }
  }, [email]); // akan dipanggil SETIAP KALI email berubah

  const handleLoginManual = async (e) => {
    if (role === "kepalaSekolah") {
      setRole("guru");
    }
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) {
        throw new Error("Login gagal");
      }

      const data = await response.json();
      localStorage.setItem("token", data.Data.access_token);
      localStorage.setItem("refresh_token", data.Data.refresh_token);
      localStorage.setItem("user_data", JSON.stringify(data.Data));

      if (data.Data.role === "admin") {
        navigate("/", { replace: true });
      } else if (data.Data.role === "guru") {
        navigate("/guru", { replace: true });
      }
      window.location.reload();
    } catch (error) {
      console.error("Login error:", error);
      alert("Login gagal, cek email dan role!");
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const userEmail = result.user.email;
        setEmail(userEmail);
      })
      .catch((error) => {
        console.warn("Popup login gagal, coba redirect...", error);
        signInWithRedirect(auth, provider);
      });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[url(../../../public/img/sd8crop.jpg)] bg-no-repeat bg-fixed bg-center bg-cover p-6">
      {/* <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6"> */}
      {/* <div className="relative h-screen w-full overflow-hidden"> */}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 z-0" />
      <div className="absolute bg-white p-8 rounded-lg shadow-lg w-full max-w-sm z-3">
        <h1 className="text-2xl font-semibold text-center mb-6">Login</h1>

        {email && (
          <p className="mt-4 mb-4 text-center text-gray-700">
            Login sebagai: <span className="font-semibold">{email}</span>
          </p>
        )}

        <button
          onClick={signInWithGoogle}
          className="flex items-center justify-center gap-3 w-full max-w-md px-4 py-3 text-gray-600 font-medium bg-white rounded-md shadow border border-gray-300 hover:shadow-md transition-shadow"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-5 h-5"
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Sign in with Google</span>
        </button>

        {/* Login Manual */}
        <form onSubmit={handleLoginManual} className="space-y-4">
          <div>
            <label
              htmlFor="role"
              className="mt-4 mb-4 text-center block text-gray-700"
            >
              Pilih Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Pilih Role --</option>
              <option value="guru">Guru</option>
              <option value="kepalaSekolah">Kepala Sekolah</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 disabled:bg-gray-400"
          >
            {loading ? "Logging in..." : "Lanjutkan Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
