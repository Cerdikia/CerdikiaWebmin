import MapelRedirect from "../view/MapelRedirect";
import GuruPage from "../view/GuruPage";
import AdminPage from "../view/AdminPage";
import DetailMapel from "../view/DetailMapel";
import ModuleDetail from "../view/ModuleDetail";

const routes = [
  { path: "/mapel", element: <MapelRedirect /> },
  { path: "/guru", element: <GuruPage /> },
  { path: "/admin", element: <AdminPage /> },
  { path: "/detail-mapel/:id", element: <DetailMapel /> },
  { path: "/detail-module/:id", element: <ModuleDetail /> },
];

export default routes;
