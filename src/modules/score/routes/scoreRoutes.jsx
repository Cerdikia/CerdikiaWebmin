import { lazy } from "react"

const ScoreList = lazy(() => import("../pages/ScoreList"))

export default [
  {
    path: "/scores",
    element: <ScoreList />,
  },
]
