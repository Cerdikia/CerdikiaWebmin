"use client"

import { Suspense, useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Header from "./Header"
import Footer from "./Footer"

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true) // Default to open on desktop
  const [darkMode, setDarkMode] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile and initialize dark mode from localStorage
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      // On mobile, sidebar should be closed by default
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      } else {
        // On desktop, check localStorage for sidebar state
        const savedSidebarState = localStorage.getItem("sidebarOpen")
        setSidebarOpen(savedSidebarState === null ? true : savedSidebarState === "true")
      }
    }

    // Initial check
    checkMobile()

    // Add resize listener
    window.addEventListener("resize", checkMobile)

    // Initialize dark mode
    const savedDarkMode = localStorage.getItem("darkMode") === "true"
    setDarkMode(savedDarkMode)

    if (savedDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  const toggleSidebar = () => {
    const newState = !sidebarOpen
    setSidebarOpen(newState)

    // Only save state on desktop
    if (!isMobile) {
      localStorage.setItem("sidebarOpen", newState.toString())
    }
  }

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem("darkMode", newDarkMode.toString())

    if (newDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Header toggleSidebar={toggleSidebar} isDarkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="flex flex-1 pt-16">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} isMobile={isMobile} />

        <div
          className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
            sidebarOpen && !isMobile ? "lg:ml-72" : ""
          }`}
        >
          <main className="p-6 flex-grow">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-screen">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-700 dark:text-gray-300">Loading...</p>
                  </div>
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  )
}
