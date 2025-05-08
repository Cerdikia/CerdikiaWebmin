"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { signOut } from "firebase/auth"
import { auth } from "../../firebase-config"
import {
  Menu,
  X,
  Home,
  Book,
  FileText,
  Users,
  LogOut,
  ChevronDown,
} from "lucide-react"

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [userData, setUserData] = useState(null)
  const [activeSubmenu, setActiveSubmenu] = useState(null)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const data = localStorage.getItem("user_data")
    const jsonData = JSON.parse(data)
    setUserRole(jsonData.role)

    // console.log(userData)

    if (data) {
      setUserData(JSON.parse(data))
    }
  }, [])

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const toggleSubmenu = (menu) => {
    if (activeSubmenu === menu) {
      setActiveSubmenu(null)
    } else {
      setActiveSubmenu(menu)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem("token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("user_data")
      navigate("/login", { replace: true })
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const menuItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: Home,
      roles: ["admin", "guru"],
    },
    {
      path: "/mapel",
      label: "Mata Pelajaran",
      icon: Book,
      roles: ["admin", "guru"],
    },
    {
      label: "Manajemen Soal",
      icon: FileText,
      submenu: [
        { path: "/list-soal", label: "Daftar Soal" },
        { path: "/upload-soal", label: "Upload Soal" },
      ],
      roles: ["admin", "guru"],
    },
    {
      path: "/blog",
      label: "Blog",
      icon: FileText,
      roles: [],
    },
    {
      path: "/users",
      label: "Pengguna",
      icon: Users,
      roles: ["admin", "guru"],
    },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md focus:outline-none lg:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-xl w-72 transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo and brand */}
        <div className="flex items-center justify-center h-20 border-b border-gray-200">
          <h1 className="text-xl font-bold text-indigo-600">Cerdikia Webmin</h1>
        </div>

        {/* User info */}
        {userData && (
          <div
            className="px-6 py-4 border-b border-gray-200 cursor-pointer"
            onClick={() =>
              navigate(`/users/edit/${encodeURIComponent(userData.email)}`, {
                state: { user: userData, role: userData.role },
              })
            }
          >
            <div
              className="flex items-center space-x-3"
              // onClick={() =>
              //   // navigate(`/users/edit/${encodeURIComponent(userData.email)}`)
              //   navigate(`/users/edit/${userData.email}`)
              // }
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                {/* {userData.email?.charAt(0).toUpperCase() || "U"} */}
                <img
                  className="h-10 w-10 rounded-full object-cover border border-gray-200"
                  src={userData.image_profile || "/img/default_user.png"}
                  alt={userData.email}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userData.email || "User"}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {userData.role || "User"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="px-4 py-4">
          <ul className="space-y-1">
            {menuItems
              .filter((item) => item.roles.includes(userRole))
              .map((item, index) => (
                <li key={index}>
                  {item.submenu ? (
                    <div className="mb-2">
                      <button
                        onClick={() => toggleSubmenu(item.label)}
                        className="flex items-center justify-between w-full px-4 py-2.5 text-left text-sm font-medium rounded-lg hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          {item.icon && (
                            <item.icon className="w-5 h-5 mr-3 text-gray-500" />
                          )}
                          <span>{item.label}</span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${activeSubmenu === item.label ? "rotate-180" : ""}`}
                        />
                      </button>

                      {activeSubmenu === item.label && (
                        <ul className="pl-10 mt-1 space-y-1">
                          {item.submenu.map((subItem, subIndex) => (
                            <li key={subIndex}>
                              <Link
                                to={subItem.path}
                                className={`block px-4 py-2 text-sm rounded-lg ${
                                  isActive(subItem.path)
                                    ? "bg-indigo-50 text-indigo-600 font-medium"
                                    : "text-gray-600 hover:bg-gray-50"
                                }`}
                                onClick={() => setIsOpen(false)}
                              >
                                {subItem.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
                        isActive(item.path)
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.icon && <item.icon className="w-5 h-5 mr-3" />}
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
          </ul>

          <div className="pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main content wrapper with padding for sidebar */}
      <div className="lg:pl-72 min-h-screen transition-all duration-300">
        {/* Your page content goes here */}
      </div>
    </>
  )
}
