import { useState } from "react";
import { Link, useLocation  } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation(); // dapetin route aktif
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { path: "/", label: "Home" },
    { path: "/mapel", label: "mapel" },
    { path: "/blog", label: "Blog" },
    { path: "/logout", label: "Logout" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex">
      {/* Hamburger Button */}
      <button
        className={`fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md focus:outline-none transition-transform duration-300 ${
          isOpen ? "rotate-180" : ""
        }`} // Tambahkan class untuk rotasi saat sidebar terbuka
        onClick={toggleSidebar}
      >
        <div className="space-y-1">
          <span className="block w-6 h-0.5 bg-white"></span>
          <span className="block w-6 h-0.5 bg-white"></span>
          <span className="block w-6 h-0.5 bg-white"></span>
        </div>
      </button>


      {/* ==================== Sidebar 1 Start ================================ */}
      {/* Sidebar */}
      {/* <div
        className={`fixed top-0 left-0 h-full bg-gray-800 text-white w-64 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-40`}
      > */}
        {/* <div className="p-4 pt-16 text-lg font-bold border-b border-gray-600">
          My App
        </div> */}
        {/* <nav className="flex flex-col p-4 space-y-4"> */}
          {/* <Link to="/" onClick={() => setIsOpen(false)} className="hover:bg-gray-700 p-2 rounded">Home</Link> */}
          {/* <Link to="/" className="hover:bg-gray-700 p-2 rounded">Home</Link>
          <Link to="/mapel" className="hover:bg-gray-700 p-2 rounded">Mata Pelajaran</Link>
          <Link to="/logout" className="hover:bg-gray-700 p-2 rounded">Logout</Link>
          <Link to="/blog" className="hover:bg-gray-700 p-2 rounded">blog</Link> */}
        {/* </nav> */}
      {/* </div> */}
      {/* ==================== Sidebar 1 End ================================ */}
      {/* ==================== Sidebar 2 Start ================================ */}
            {/* Sidebar */}
            <div
        className={`fixed top-0 left-0 h-full bg-gray-800 text-white w-64 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="p-4 pt-16 text-lg font-bold border-b border-gray-600">
          My App
        </div>
        <nav className="flex flex-col p-4 space-y-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`p-2 rounded ${
                isActive(item.path)
                  ? "bg-gray-700 font-semibold"
                  : "hover:bg-gray-700"
              }`}
              onClick={() => setIsOpen(false)} // klik link sekalian nutup sidebar
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      {/* ==================== Sidebar 2 End ================================ */}

      {/* Hamburger Button */}
      {/* <button
        className="fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md focus:outline-none"
        onClick={toggleSidebar}
      >
        <div className="space-y-1">
          <span className="block w-6 h-0.5 bg-white"></span>
          <span className="block w-6 h-0.5 bg-white"></span>
          <span className="block w-6 h-0.5 bg-white"></span>
        </div>
      </button> */}

      {/* Main Content */}
      {/* <div className="flex-1 p-8 ml-0 md:ml-64">
        <h1 className="text-2xl font-bold mb-4">Main Content Area</h1>
        <p>Isi halaman utama di sini...</p>
      </div> */}
    </div>
  );
}
