import { Navigate } from "react-router-dom";

export default function MapelRedirect() {
  const userData = JSON.parse(localStorage.getItem("user_data"));

  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  if (userData.role === "guru") {
    return <Navigate to="/guru" replace />;
  } else if (userData.role === "admin") {
    return <Navigate to="/admin" replace />;
  } else {
    return <div>Akses tidak diizinkan</div>;
  }
}
