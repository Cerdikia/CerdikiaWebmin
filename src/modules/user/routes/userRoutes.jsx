import { lazy } from "react"

const UserList = lazy(() => import("../pages/UserList"))
const UserDetail = lazy(() => import("../pages/UserDetail"))
const UserForm = lazy(() => import("../pages/UserForm"))

export default [
  {
    path: "/users",
    element: <UserList />,
  },
  {
    path: "/users/new",
    element: <UserForm />,
  },
  {
    path: "/users/edit/:id",
    element: <UserForm />,
  },
  {
    path: "/users/:id",
    element: <UserDetail />,
  },
]
