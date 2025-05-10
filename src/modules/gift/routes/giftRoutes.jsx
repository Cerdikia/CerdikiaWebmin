import { lazy } from "react"

const GiftList = lazy(() => import("../pages/GiftList"))
const GiftUpload = lazy(() => import("../pages/GiftUpload"))
const GiftEdit = lazy(() => import("../pages/GiftEdit"))

export default [
  {
    path: "/gifts",
    element: <GiftList />,
  },
  {
    path: "/gifts/upload",
    element: <GiftUpload />,
  },
  {
    path: "/gifts/edit/:id",
    element: <GiftEdit />,
  },
]
