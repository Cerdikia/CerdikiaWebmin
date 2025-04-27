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

export default [
  {
    path: '/',
    element: <HomePage />,
  }
];
