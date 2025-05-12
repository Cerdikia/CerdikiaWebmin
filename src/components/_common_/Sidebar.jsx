"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Home, Book, Users, ChevronDown, BarChart, Gift, X } from "lucide-react"

export default function Sidebar({ isOpen, toggleSidebar, isMobile }) {
  const location = useLocation()
  const [activeSubmenu, setActiveSubmenu] = useState(null)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const data = localStorage.getItem("user_data")
    if (data) {
      const jsonData = JSON.parse(data)
      setUserRole(jsonData?.role)
    }
  }, [])

  // Check if current path is in submenu to auto-expand it
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.submenu) {
        const isInSubmenu = item.submenu.some(
          (subItem) => location.pathname === subItem.path,
        )
        if (isInSubmenu) {
          setActiveSubmenu(item.label)
        }
      }
    })
  }, [location.pathname])

  const toggleSubmenu = (menu) => {
    if (activeSubmenu === menu) {
      setActiveSubmenu(null)
    } else {
      setActiveSubmenu(menu)
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
      label: "Student Performance",
      icon: BarChart,
      submenu: [
        { path: "/scores", label: "Student Scores" },
        { path: "/rankings", label: "Student Rankings" },
      ],
      roles: ["admin", "guru"],
    },
    {
      path: "/users",
      label: "Pengguna",
      icon: Users,
      roles: ["admin", "guru"],
    },
    {
      label: "Gift Management",
      icon: Gift,
      submenu: [
        { path: "/gifts", label: "Gift List" },
        { path: "/gifts/upload", label: "Upload Gift" },
      ],
      roles: ["admin"],
    },
    {
      label: "Student Management",
      icon: UserCheck,
      submenu: [
        { path: "/student-verification", label: "Verification" },
        // { path: "/messages", label: "Messages" },
        {
          path: "/messages",
          label: "Messages",
          icon: MessageCircle,
          badge: unreadCount > 0 ? unreadCount : null,
        },
      ],
      badge: unreadCount > 0 ? unreadCount : null,
      roles: ["admin"],
    },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-xl w-72 transform transition-transform duration-300 ease-in-out z-30 pt-16 overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button for mobile */}
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        )}

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
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
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
        <nav className="px-4 py-4 mt-2">
          <ul className="space-y-1">
            {menuItems
              .filter((item) => item.roles.includes(userRole))
              .map((item, index) => (
                <li key={index}>
                  {item.submenu ? (
                    <div className="mb-2">
                      <button
                        onClick={() => toggleSubmenu(item.label)}
                        className="flex items-center justify-between w-full px-4 py-2.5 text-left text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        <div className="flex items-center">
                          {item.icon && (
                            <item.icon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                          )}
                          <span>{item.label}</span>
                        </div>
                        <div className="flex items-center">
                          {item.badge && (
                            <NotificationBadge count={item.badge} />
                          )}
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${activeSubmenu === item.label ? "rotate-180" : ""}`}
                          />
                        </div>
                      </button>

                      {activeSubmenu === item.label && (
                        <ul className="pl-10 mt-1 space-y-1">
                          {item.submenu.map((subItem, subIndex) => (
                            <li key={subIndex}>
                              <Link
                                to={subItem.path}
                                className={`block px-4 py-2 text-sm rounded-lg ${
                                  isActive(subItem.path)
                                    ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                }`}
                                onClick={() => {
                                  if (isMobile) {
                                    toggleSidebar()
                                  }
                                }}
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
                          ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => {
                        if (isMobile) {
                          toggleSidebar()
                        }
                      }}
                    >
                      <div className="flex items-center">
                        {item.icon && <item.icon className="w-5 h-5 mr-3" />}
                        {/* {item.label} */}
                        <span>{item.label}</span>
                      </div>
                      {item.badge && <NotificationBadge count={item.badge} />}
                    </Link>
                  )}
                </li>
              ))}
          </ul>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
    </>
  )
}
