"use client"

import { useState, useRef, useEffect } from "react"
import { Menu, Moon, Sun } from "lucide-react"
import { Link } from "react-router-dom"
import { signOut } from "firebase/auth"
import { auth } from "../../firebase-config"

export default function Header({ toggleSidebar, isDarkMode, toggleDarkMode }) {
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    // Get user data from localStorage
    const data = localStorage.getItem("user_data")
    if (data) {
      setUserData(JSON.parse(data))
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Get user initials for avatar
  const getInitials = () => {
    if (!userData || !userData.nama) return "U"
    const nameParts = userData.nama.split(" ")
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    }
    return userData.nama[0].toUpperCase()
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-4 lg:px-6">
      {/* Left section with logo and menu toggle */}
      <div className="flex items-center">
        <div className="flex items-center ml-2 lg:ml-0">
          <Link to="/" className="flex items-center">
            <img src="/vite.svg" alt="Logo" className="h-8 w-8 mr-2" />
            <span className="text-l font-bold text-indigo-600 dark:text-indigo-400 hidden md:inline-block">
              LMS SD Negeri 8 Metro Pusat
            </span>
          </Link>
        </div>

        <div className="mx-4 h-6 border-l border-gray-300 dark:border-gray-600 hidden md:block"></div>

        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>

        <div className="hidden lg:flex items-center ml-6">
          <span className="text-gray-700 dark:text-gray-300 font-medium">DASHBOARD</span>
        </div>
      </div>

      {/* Right section with theme toggle and user info */}
      <div className="flex items-center space-x-4">
        {/* Theme toggle button */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* User profile */}
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center focus:outline-none">
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-white font-semibold">
              {userData?.image_profile ? (
                <img
                  src={userData.image_profile || "/placeholder.svg"}
                  alt={userData.nama || "User"}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                getInitials()
              )}
            </div>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{userData?.nama || "User"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{userData?.email || ""}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">{userData?.role || "User"}</p>
              </div>
              <Link
                to={`/users/edit/${encodeURIComponent(userData?.email || "")}`}
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                state={{ user: userData, role: userData?.role }}
                onClick={() => setShowDropdown(false)}
              >
                Preference
              </Link>
              <Link
                to="/login"
                className="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={async () => {
                  try {
                    await signOut(auth)
                    localStorage.removeItem("token")
                    localStorage.removeItem("refresh_token")
                    localStorage.removeItem("user_data")
                    setShowDropdown(false)
                  } catch (error) {
                    console.error("Logout error:", error)
                  }
                }}
              >
                Logout
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
