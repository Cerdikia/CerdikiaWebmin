"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, X } from "lucide-react"

export default function Notification({
  type = "success",
  message,
  onClose,
  duration = 5000,
}) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        onClose && onClose()
      }, 300) // Wait for fade out animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-white" />
      case "error":
        return <XCircle className="h-5 w-5 text-white" />
      default:
        return <CheckCircle className="h-5 w-5 text-white" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-green-500"
    }
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      } ${getBackgroundColor()}`}
    >
      <div className="flex-shrink-0 mr-3">{getIcon()}</div>
      <div className="text-white mr-3">{message}</div>
      <button
        onClick={() => {
          setIsVisible(false)
          setTimeout(() => {
            onClose && onClose()
          }, 300)
        }}
        className="text-white hover:text-gray-200"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}
