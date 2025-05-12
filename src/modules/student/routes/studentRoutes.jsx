import { lazy } from "react"

const StudentVerification = lazy(() => import("../pages/StudentVerification"))
const MessageList = lazy(() => import("../pages/MessageList"))
const MessageDetail = lazy(() => import("../pages/MessageDetail"))

// export default [
const studentRoutes = [
  {
    path: "/student-verification",
    element: <StudentVerification />,
  },
  {
    path: "/messages",
    element: <MessageList />,
  },
  {
    path: "/messages/:id",
    element: <MessageDetail />,
  },
]

export default studentRoutes
