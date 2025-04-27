import { Navigate } from "react-router-dom";
// import { lazy } from "react";

// const Mapel = lazy(() => import("../view/Mapel"))

// export default[
//   {
//     path: '/mapel',
//     element: <Mapel />
//   }
// ]
export default function MapelRedirect() {
  const userData = JSON.parse(localStorage.getItem("user_data"));

  // if (!userData) {
  //   return <Navigate to="/login" replace />; // kalau tidak ada user, balik login
  // }

  if (userData.Data.role === "guru") {
    return <Navigate to="/guru" replace />;
  } else if (userData.Data.role === "admin") {
    return <Navigate to="/admin" replace />;
  } else {
    return <div>Akses tidak diizinkan</div>;
  }
}
