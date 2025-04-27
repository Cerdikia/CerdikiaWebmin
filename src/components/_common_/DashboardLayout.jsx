import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 ml-0 md:ml-64">
        {/* Semua halaman (content) akan ditampilkan di sini */}
        <Outlet />
      </div>
    </div>
  );
}
