import { lazy } from "react"

const ScoreList = lazy(() => import("../pages/ScoreList"))
const RankingPage = lazy(() => import("../pages/RankingPage")) // Add the new Ranking page
const ScoreReport = lazy(() => import("../pages/ScoreReport"))
const SemesterRecap = lazy(() => import("../pages/SemesterRecap"))

export default [
  {
    path: "/scores",
    element: <ScoreList />,
  },
  {
    path: "/rankings",
    element: <RankingPage />, // Add the new route
  },
  {
    path: "/score-report",
    element: <ScoreReport />, // Add the new route
  },
  {
    path: "/semester-recap",
    element: <SemesterRecap />,
  },
]
