// import { lazy } from "react";

// const HomePage = lazy(() => import("../view/HomePage"));

// export default [
//   {
//     path: '/',
//     element: <HomePage />,
//   }
// ];

import { lazy } from "react";

const HomePage = lazy(() => import("../view/HomePage"));
const GuruPage = lazy(() => import("../view/GuruPage"));

export default [
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/guru",
    element: <HomePage />,
  },
];
