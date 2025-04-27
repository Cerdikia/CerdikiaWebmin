import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import PrivateRoute from "/src/components/_common_/PrivateRoute";
import DashboardLayout from "/src/components/_common_/DashboardLayout";

const Login = lazy(() => import("./modules/auth/view/Login.jsx"));

// function untuk load semua route file
async function getRoutes() {
  const routes = [];

  // Scan semua file di folder modules/**/routes/*.jsx
  const modules = import.meta.glob('/src/modules/**/routes/*.jsx');

  for (const path in modules) {
    const module = await modules[path]();
    // Anggap module export default array of routes
    routes.push(...module.default);
  }

  return routes;
}

// function utama buat router
export async function autoLoadRoute() {
  const routes = await getRoutes();

  const router = createBrowserRouter([
    {
      // path: '/',
      // element: <div>Home Page</div>, // ini default page
      path: "/login",
      // element: lazy(() => import("./modules/auth/view/Login.jsx"))(),
      element: <Login />,
      // element: <Login />,
      // meta: { layout: "auth" } // opsional, kalau mau beda layout
    },
    // {
    //   path: "/",
    //   element: <PrivateRoute />, // <- semua route di bawah ini dilindungi
    //   children: [
    //     ...routes,
    //   ],
    // },
    {
      path: "/",
      element: <PrivateRoute />, // Semua route protected
      children: [
        {
          path: "/",
          element: <DashboardLayout />, // <-- Pakai Layout
          children: [
            ...routes,
          ]
        },
      ]
    },
  ]);

  return router;
}
