import { lazy } from "react"

const GiftList = lazy(() => import("../pages/GiftList"))
const GiftUpload = lazy(() => import("../pages/GiftUpload"))
const GiftEdit = lazy(() => import("../pages/GiftEdit"))
const RedemptionReceipt = lazy(() => import("../pages/RedemptionReceipt"))
const RedemptionList = lazy(() => import("../pages/RedemptionList"))

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
  {
    path: "/gifts/receipt/:code",
    element: <RedemptionReceipt />,
  },
  {
    path: "/gifts/redemptions",
    element: <RedemptionList />,
  },
]
