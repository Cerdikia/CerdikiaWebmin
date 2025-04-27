import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute() {
  const isAuthenticated = localStorage.getItem("token"); // cek token login

return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
