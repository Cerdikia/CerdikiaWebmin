"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth"
import { auth } from "../../../firebase-config"

const provider = new GoogleAuthProvider()
provider.setCustomParameters({
  prompt: "select_account",
})

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    console.log(import.meta.env.VITE_API_URL)
    // Handle redirect result
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          const userEmail = result.user.email
          setEmail(userEmail)
        }
      })
      .catch((error) => {
        console.error("Redirect login error:", error)
        setError("Login gagal: " + error.message)
      })
  }, [])

  useEffect(() => {
    if (email) {
      console.log("Email berhasil diset:", email)
    }
  }, [email])

  const handleContinueWithRole = async (e) => {
    e.preventDefault()

    if (!role) {
      setError("Silakan pilih role terlebih dahulu")
      return
    }

    if (!email) {
      setError("Silakan login dengan Google terlebih dahulu")
      return
    }

    setLoading(true)

    try {
      // In a real app, you would verify the role with your backend
      // For now, we'll just store it in localStorage

      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          role,
        }),
      })

      if (response.status === 401) {
        setError("Akses ditolak. Cek email atau role Anda.")
        setLoading(false)
        return
      }

      const data = await response.json()

      if (data.Message && data.Message.includes("Successfuly Login")) {
        // Store tokens in localStorage
        localStorage.setItem("access_token", data.Data.access_token)
        localStorage.setItem("refresh_token", data.Data.refresh_token)

        localStorage.setItem("user_data", JSON.stringify(data.Data))
      }

      // If the user is a guru, fetch their subjects
      if (role === "guru" && data.Data.id) {
        try {
          console.log("Fetching teacher subjects for ID:", data.Data.id)
          const guruResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/guru/${data.Data.id}`,
            {
              headers: {
                Authorization: `Bearer ${data.Data.access_token}`,
              },
            },
          )

          if (guruResponse.ok) {
            console.log("Teacher data received:", guruData)
            const guruData = await guruResponse.json()
            if (guruData && Array.isArray(guruData.mapel)) {
              // Store teacher's subjects in localStorage
              localStorage.setItem("guru_mapel", JSON.stringify(guruData.mapel))
              console.log("Stored teacher subjects:", guruData.mapel)
            }
          } else {
            console.error(
              "Failed to fetch teacher subjects:",
              guruResponse.status,
            )
          }
        } catch (error) {
          console.error("Error fetching teacher subjects:", error)
        }
      }
      // Redirect based on role
      if (role === "guru") {
        navigate("/guru", { replace: true })
      } else {
        navigate("/", { replace: true })
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Login gagal, cek email dan role!")
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = () => {
    setLoading(true)
    signInWithPopup(auth, provider)
      .then((result) => {
        const userEmail = result.user.email
        setEmail(userEmail)
      })
      .catch((error) => {
        console.warn("Popup login gagal, coba redirect...", error)
        signInWithRedirect(auth, provider)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-100 to-white">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30 z-10" />
        <img
          src="/img/sd8.jpg"
          alt="School"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 flex flex-col justify-center items-start p-12 text-white h-full">
          <h1 className="text-4xl font-bold mb-4">
            LMS SD Negeri 8 Metro Pusat
          </h1>
          <p className="text-xl opacity-90 max-w-md">
            Platform manajemen pembelajaran untuk meningkatkan kualitas
            pendidikan
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Selamat Datang
            </h1>
            <p className="text-gray-600">Silakan login untuk melanjutkan</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              {error}
            </div>
          )}

          <div className="mb-8">
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 text-gray-700 font-medium bg-white rounded-lg shadow border border-gray-300 hover:shadow-md transition-shadow"
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
              <span>Login dengan Google</span>
            </button>
          </div>

          {email && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
              <p className="font-medium">Login berhasil</p>
              <p>Email: {email}</p>
            </div>
          )}

          <form onSubmit={handleContinueWithRole} className="space-y-6">
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Pilih Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">-- Pilih Role --</option>
                <option value="guru">Guru</option>
                {/* <option value="kepalaSekolah">Kepala Sekolah</option> */}
                <option value="kepalaSekolah">Kepala Sekolah</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition duration-200 disabled:bg-indigo-400"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Lanjutkan"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
