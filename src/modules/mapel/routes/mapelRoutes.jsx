import MapelRedirect from "../view/MapelRedirect"
// import GuruPage from "../view/GuruPage";
import AdminPage from "../view/AdminPage"
import ListModule from "../view/ListModule"
import ListSoal from "../view/ListSoal"
import CobaQuil from "../view/CobaQuil"
import UploadSoal from "../view/UploadSoal"
import EditSoal from "../view/EditSoal"
import ImportModule from "../view/ImportModule"

const routes = [
  { path: "/mapel", element: <MapelRedirect /> },
  { path: "/guru", element: <AdminPage /> },
  { path: "/admin-mapel", element: <AdminPage /> },
  { path: "/list-module/:id", element: <ListModule /> },
  { path: "/list-soal/:id", element: <ListSoal /> },
  { path: "/upload-soal/:id", element: <UploadSoal /> },
  { path: "/coba-quil", element: <CobaQuil /> },
  { path: "/edit-soal/:id_soal/:id_module", element: <EditSoal /> },
  { path: "/import-module", element: <ImportModule /> },
]

export default routes
