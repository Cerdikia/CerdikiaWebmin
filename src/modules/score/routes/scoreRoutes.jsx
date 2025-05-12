import { lazy } from "react"

const ScoreList = lazy(() => import("../pages/ScoreList"))
const RankingPage = lazy(() => import("../pages/RankingPage")) // Add the new Ranking page

export default [
  {
    path: "/scores",
    element: <ScoreList />,
  },
  {
    path: "/rankings",
    element: <RankingPage />, // Add the new route
  },
]
